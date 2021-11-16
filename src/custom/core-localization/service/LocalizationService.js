import Exception from "../../core/Exception.js";
import Language from "../models/Language.js";
import Localization from "../models/Localization.js";

export default class LocalizationService {
    static async getAllLanguages() {
        return (await Language.findAll()).map(lang => {
            return {
                // @ts-ignore
                id: lang.localeIdentifier,
                // @ts-ignore
                name: lang.name
            };
        }).sort((a, b) => {
            return a.id.localeCompare(b.id);
        });
    }

    static getLanguageFromIdentifier(identifier) {
        let language = Language.findOne({where: {localeIdentifier: identifier}});
        if(!language) throw new Exception("Language does not exist", {code: "CORE.LOCALIZATION.INVALID_LANGUAGE"});

        return language;
    }

    static createLanguage(name, languageId) {
        try {
            return Language.create({
                name,
                localeIdentifier: languageId
            });
        }
        catch {
            throw new Exception("Language exists", {code: "CORE.LOCALIZATION.LANGUAGE_EXISTS"});
        }
    }

    static async getTranslation(language, key, replacements) {
        let translationObject = await Localization.findOne({
            where: {
                key
            },
            include: [
                {
                    model: Language,
                    where: {
                        localeIdentifier: language
                    }
                }
            ]
        });

        if(!translationObject) return null;

        // @ts-ignore
        return this.formatTranslationString(translationObject.value, replacements);
    }

    static async setTranslation(language, key, value) {
        let languageObj = await this.getLanguageFromIdentifier(language);
        if(!languageObj) throw new Exception("Invalid Language code", {code: "CORE.LOCALIZATION.INVALID_LANGUAGE_CODE"});

        let [find, newCreated] = await Localization.findOrCreate({
            where: {
                key,
                // @ts-ignore
                LanguageId: languageObj.id
            },
            defaults: {
                value
            }
        });

        if(!newCreated) {
            await find.update({
                value
            });
        }
    }

    static async deleteTranslation(language, key) {
        let languageObj = await this.getLanguageFromIdentifier(language);
        if(!languageObj) throw new Exception("Invalid Language code", {code: "CORE.LOCALIZATION.INVALID_LANGUAGE_CODE"});

        let translationObject = await Localization.findOne({
            where: {
                key
            },
            include: [
                {
                    model: Language,
                    where: {
                        localeIdentifier: language
                    }
                }
            ]
        });

        if(!translationObject) return;

        await translationObject.destroy();
    }

    /**
     * @static
     * @param {string} translationString
     * @param {any} [replacements={}]
     * @return {string}
     * @memberof LocalizationService
     */
    static formatTranslationString(translationString, replacements = {}) {
        let result = translationString;
        for (let key in replacements) {
            result = result.replace(`{k:${key}}`, replacements[key]);
        }

        [...result.matchAll(/{c: *([^}]+)}/g)].forEach(match => {
            // eslint-disable-next-line no-new-func
            let func = new Function("$", `return ${match[1]}`);
            result = result.replace(match[0], func(replacements));
        });

        return result;
    }
}
