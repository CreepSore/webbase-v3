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
import permissions from "./permissions.js";
import SettingsService from "../core/service/SettingsService.js";
import settings from "./settings.js";

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

    async onStartMainApplication() {
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Language.initialize(params.sequelize);
        Localization.initialize(params.sequelize);

        Language.hasMany(Localization);
        Localization.belongsTo(Language);
    }

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await SettingsService.createSetting(settings.defaultLanguage.key, settings.defaultLanguage.value);
        await this.getApi("Core.Authentication").setupPermissionsByObject(permissions);

        await Language.findOrCreate({
            where: {
                name: "English",
                localeIdentifier: "en"
            }
        });

        await Language.findOrCreate({
            where: {
                name: "German",
                localeIdentifier: "de"
            }
        });

        await Version.findOrCreate({
            where: {
                name: this.extensionInfo.name,
                version: this.extensionInfo.version
            }
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
            permissions: [permissions.core_localization_get_languages.key]
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
            permissions: [permissions.core_localization_get_languages.key]
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
            permissions: [permissions.core_localization_create_language.key],
            profilingName: "CORE.LOCALIZATION.CREATE_LANGUAGE"
        }));

        apiRouter.get("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION:${String(langCode).toUpperCase()}:${String(translationCode).toUpperCase()}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json({success: true, data: translation});
        }, {
            permissions: [permissions.core_localization_get_translation.key]
        }));

        apiRouter.post("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let replacements = req.body;
            let translation = await CacheProvider.instance.process(`CORE.LOCALIZATION.GET-TRANSLATION:${String(langCode).toUpperCase()}:${String(translationCode).toUpperCase()}`, () => {
                return LocalizationService.getTranslation(langCode, translationCode);
            }, 60000);

            res.json({success: true, data: LocalizationService.formatTranslationString(translation, replacements)});
        }, {
            permissions: [permissions.core_localization_get_translation_formatted.key],
            profilingName: "CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED"
        }));

        apiRouter.put("/translation/:langCode/:translationCode", ExpressRouteWrapper.create(async(req, res) => {
            let {langCode, translationCode} = req.params;
            let {translation} = req.body;

            await LocalizationService.setTranslation(langCode, translationCode, translation);
            CacheProvider.instance.invalidate(`CORE.LOCALIZATION.GET-TRANSLATION:${String(langCode).toUpperCase()}:${String(translationCode).toUpperCase()}`);
            res.json({success: true});
        }, {
            permissions: [permissions.core_localization_set_translation.key],
            profilingName: "CORE.LOCALIZATION.SET_TRANSLATION"
        }));

        apiRouter.get("/translation/missing", ExpressRouteWrapper.create(async(req, res) => {
            res.json({success: true, data: [...LocalizationService.missingTranslations]});
        }, {
            permissions: [permissions.core_localization_get_missing.key],
            profilingName: "CORE.LOCALIZATION.GET_MISSING"
        }));

        apiRouter.get("/translation/all", ExpressRouteWrapper.create(async(req, res) => {
            res.json({success: true, data: await LocalizationService.getAllTranslations()});
        }, {
            permissions: [permissions.core_localization_get_all_translations.key],
            profilingName: "CORE.LOCALIZATION.GET_ALL"
        }));

        viewRouter.get("/edit", ExpressRouteWrapper.create(async(req, res) => {
            res.send(Utils.renderDefaultReactPage("/compiled/core.localization/edit.js", {
                title: "Localization"
            }));
        }, {
            permissions: [permissions.core_localization_edit_translation.key],
            onInvalidPermissions: (req, res) => {
                res.redirect(this.getApi("Core.Authentication").constructRedirectUrl(req.originalUrl));
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
