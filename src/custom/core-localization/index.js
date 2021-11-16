/* eslint-disable no-unused-vars */
import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";

import Localization from "./models/Localization.js";
import Version from "../../models/Version.js";
import Language from "./models/Language.js";
import CommandHandler from "../../service/command-handler/CommandHandler.js";
import LocalizationService from "./service/LocalizationService.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import CacheProvider from "../../service/CacheProvider.js";
import PermissionService from "../core-usermgmt/service/PermissionService.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class Core extends CustomerLogic {
    /** @param {import("../../service/customer-logic/types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {
        params.commandHandler.registerSubHandler("loc", CommandHandler.createFromObject({
            subHandlers: {
                translation: {
                    commands: {
                        get: {
                            help: "<language> <translation_key> [replacements]; Gets a translation. replacements = json",
                            callback: async(args) => {
                                let replacements = {};
                                if(args[2]) {
                                    replacements = JSON.parse(args[2]);
                                }

                                let translation = await LocalizationService.getTranslation(args[0], args[1], replacements);
                                console.log("INFO", translation);
                            }
                        },
                        set: {
                            help: "<language> <translation_key> <translation_value> ; Sets a translation",
                            callback: async(args) => {
                                await LocalizationService.setTranslation(args[0], args[1], args[2]);
                            }
                        },
                        "delete": {
                            help: "<language|all> <translation_key>",
                            callback: async(args) => {
                                if(args[0] !== "all") {
                                    await LocalizationService.deleteTranslation(args[0], args[1]);
                                    return;
                                }

                                let allLang = await LocalizationService.getAllLanguages();
                                await Promise.all(allLang.map(language => {
                                    return LocalizationService.deleteTranslation(language.id, args[1]);
                                }));
                            }
                        }
                    }
                },
                language: {
                    commands: {
                        list: {
                            help: "List all available languages",
                            callback: async() => {
                                let locales = (await LocalizationService.getAllLanguages())
                                    .map(l => `  - ${l.id}: ${l.name}`)
                                    .join("\n");

                                console.log("INFO", `Locales:\n${locales}`);
                            }
                        }
                    }
                }
            }
        }));
    }

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Language.initialize(params.sequelize);
        Localization.initialize(params.sequelize);

        Language.hasMany(Localization);
        Localization.belongsTo(Language);
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        // permissions
        let anonymous = await PermissionService.getAnonymousPermissionGroup();
        let permGetLanguage = await PermissionService.createPermission("CORE.LOCALIZATION.GET_LANGUAGE", "Permission to get languages");
        let permCreateLanguage = await PermissionService.createPermission("CORE.LOCALIZATION.CREATE_LANGUAGE", "Permission to create languages");
        let permGetTranslation = await PermissionService.createPermission("CORE.LOCALIZATION.GET_TRANSLATION", "Permission to get translations");
        let permGetTranslationFormatted = await PermissionService.createPermission("CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED", "Permission to get translations");
        let permSetTranslation = await PermissionService.createPermission("CORE.LOCALIZATION.SET_TRANSLATION", "Permission to set translations");

        // @ts-ignore
        await anonymous.addPermissions([permGetLanguage, permGetTranslation, permGetTranslationFormatted]);

        await Language.create({
            name: "English",
            localeIdentifier: "en"
        });

        await Language.create({
            name: "German",
            localeIdentifier: "de"
        });

        await Version.create({
            name: this.extensionInfo.name,
            version: this.extensionInfo.version
        });
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStart(params) {
        let {app} = params;

        app.get("/api/localization/languages", ExpressRouteWrapper.create(async(req, res) => {
            let languages = await CacheProvider.instance.process("CORE.LOCALIZATION.GET-LANGUAGES", () => {
                return LocalizationService.getAllLanguages();
            }, 60000);
            res.json(languages);
        }, {
            permissions: ["CORE.LOCALIZATION.GET_LANGUAGE"]
        }));

        app.get("/api/localization/language/fromId/:id", ExpressRouteWrapper.create(async(req, res) => {
            let language = await CacheProvider.instance.process("CORE.LOCALIZATION.GET-LANGUAGES", () => {
                try {
                    return LocalizationService.getLanguageFromIdentifier(req.params.id);
                }
                catch(exception) {
                    res.json({success: false, error: exception});
                    return null;
                }
            }, 60000);

            if(!language) return;

            res.json(language);
        }, {
            permissions: ["CORE.LOCALIZATION.GET_LANGUAGE"]
        }));

        app.post("/api/localization/language/create/:id/:name", ExpressRouteWrapper.create(async(req, res) => {
            try {
                await LocalizationService.createLanguage(req.params.name, req.params.id);
                res.json({success: true});
            }
            catch(exception) {
                res.json({success: false, error: exception});
            }
        }, {
            permissions: ["CORE.LOCALIZATION.CREATE_LANGUAGE"]
        }));

        app.get("/api/localization/translation/get/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION::${langCode}::${translationCode}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json(translation);
        }, {
            permissions: ["CORE.LOCALIZATION.GET_TRANSLATION"]
        }));

        app.post("/api/localization/translation/get/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let replacements = req.body;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION::${langCode}::${translationCode}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json({success: true, data: LocalizationService.formatTranslationString(translation, replacements)});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED"]
        }));

        app.post("/api/localization/translation/set/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let translation = req.body;

            await LocalizationService.setTranslation(langCode, translationCode, translation);
            res.json({success: true});
        }, {
            permissions: ["CORE.LOCALIZATION.SET_TRANSLATION"]
        }));
    }

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 1000;}
    async onLoad() {
        this.extensionInfo = await this.getMetadata();
    }
    async onUnload() {}
}
