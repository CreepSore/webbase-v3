/* eslint-disable no-unused-vars */
import path from "path";

import express from "express";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Localization from "./models/Localization.js";
import Version from "../../models/Version.js";
import Language from "./models/Language.js";
import CommandHandler from "../../service/command-handler/CommandHandler.js";
import LocalizationService from "./service/LocalizationService.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import CacheProvider from "../../service/CacheProvider.js";
import PermissionService from "../core-authentication/service/PermissionService.js";
import Utils from "../../service/Utils.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class CoreLocalization extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
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

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Language.initialize(params.sequelize);
        Localization.initialize(params.sequelize);

        Language.hasMany(Localization);
        Localization.belongsTo(Language);
    }

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        // permissions
        let anonymous = await PermissionService.getAnonymousPermissionGroup();
        let permGetLanguage = await PermissionService.createPermission("CORE.LOCALIZATION.GET_LANGUAGE", "Permission to get languages");
        let permCreateLanguage = await PermissionService.createPermission("CORE.LOCALIZATION.CREATE_LANGUAGE", "Permission to create languages");
        let permGetTranslation = await PermissionService.createPermission("CORE.LOCALIZATION.GET_TRANSLATION", "Permission to get translations");
        let permGetTranslationFormatted = await PermissionService.createPermission("CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED", "Permission to get translations");
        let permSetTranslation = await PermissionService.createPermission("CORE.LOCALIZATION.SET_TRANSLATION", "Permission to set translations");
        let permGetMissing = await PermissionService.createPermission("CORE.LOCALIZATION.GET_MISSING", "Permission to get missing translations");
        let permGetAll = await PermissionService.createPermission("CORE.LOCALIZATION.GET_ALL", "Permission to get all translations, not including missing");
        let permEdit = await PermissionService.createPermission("CORE.LOCALIZATION.EDIT", "Permission to edit translations");

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

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {ExpressParams} params */
    async expressStart(params) {
        let {app} = params;

        let viewRouter = express.Router();
        let apiRouter = express.Router();

        apiRouter.get("/languages", ExpressRouteWrapper.create(async(req, res) => {
            let languages = await CacheProvider.instance.process("CORE.LOCALIZATION.GET-LANGUAGES", () => {
                return LocalizationService.getAllLanguages();
            }, 60000);
            res.json({success: true, data: languages});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_LANGUAGE"]
        }));

        apiRouter.get("/language/fromId/:id", ExpressRouteWrapper.create(async(req, res) => {
            let language = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-LANGUAGE-BY-ID:${req.params.id.toUpperCase()}`, async() => {
                try {
                    return await LocalizationService.getLanguageFromIdentifier(req.params.id);
                }
                catch(exception) {
                    res.json({success: false, error: exception});
                    return null;
                }
            }, 60000);

            if(!language) return;

            res.json({success: true, data: language});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_LANGUAGE"]
        }));

        apiRouter.post("/language/create/:id/:name", ExpressRouteWrapper.create(async(req, res) => {
            try {
                await LocalizationService.createLanguage(req.params.name, req.params.id);
                CacheProvider.instance
                    .invalidate("CORE.LOCALIZATION.GET-LANGUAGES")
                    .invalidate(`CORE.LOCALIZATION.GET-LANGUAGE-BY-ID:${req.params.id.toUpperCase()}`);
                res.json({success: true});
            }
            catch(exception) {
                res.json({success: false, error: exception});
            }
        }, {
            permissions: ["CORE.LOCALIZATION.CREATE_LANGUAGE"],
            profilingName: "CORE.LOCALIZATION.CREATE_LANGUAGE"
        }));

        apiRouter.get("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION:${langCode}:${translationCode}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json({success: true, data: translation});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_TRANSLATION"]
        }));

        apiRouter.post("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let replacements = req.body;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION:${langCode}:${translationCode}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json({success: true, data: LocalizationService.formatTranslationString(translation, replacements)});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED"],
            profilingName: "CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED"
        }));

        apiRouter.put("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let {translation} = req.body;

            await LocalizationService.setTranslation(langCode, translationCode, translation);
            CacheProvider.instance.invalidate(`CORE.LOCALIZATION.GET-TRANSLATION:${langCode}:${translationCode}`);
            res.json({success: true});
        }, {
            permissions: ["CORE.LOCALIZATION.SET_TRANSLATION"],
            profilingName: "CORE.LOCALIZATION.SET_TRANSLATION"
        }));

        apiRouter.get("/translation/missing", ExpressRouteWrapper.create(async(req, res) => {
            res.json({success: true, data: [...LocalizationService.missingTranslations]});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_MISSING"],
            profilingName: "CORE.LOCALIZATION.GET_MISSING"
        }));

        apiRouter.get("/translation/all", ExpressRouteWrapper.create(async(req, res) => {
            res.json({success: true, data: await LocalizationService.getAllTranslations()});
        }, {
            permissions: ["CORE.LOCALIZATION.GET_ALL"],
            profilingName: "CORE.LOCALIZATION.GET_ALL"
        }));

        viewRouter.get("/edit", ExpressRouteWrapper.create(async(req, res) => {
            res.send(Utils.renderDefaultReactPage("/compiled/core.localization/edit.js", {
                title: "Localization"
            }));
        }, {
            permissions: ["CORE.LOCALIZATION.EDIT"],
            onInvalidPermissions: (req, res) => {
                res.redirect("/core.authentication/login?redirectTo=%2Fcore.localization%2Fedit");
            }
        }));

        app.use("/api/core.localization", apiRouter);
        app.use("/core.localization", viewRouter);
    }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig(params) {
        return {
            entry: {
                "core.localization/edit.js": path.join(this.getPluginDir(), "web", "src", "edit", "main.jsx")
            }
        };
    }

    getPriority() {return 1000;}
    async onLoad() {
        this.extensionInfo = await this.getMetadata();
    }
    async onUnload() {}
}
