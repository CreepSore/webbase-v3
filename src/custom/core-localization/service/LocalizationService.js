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
        return Language.findOne({where: {localeIdentifier: identifier}});
    }

    static getTranslation(language, key) {
        return Localization.findOrCreate({
            where: {
                key
            },
            defaults: {
                value: key
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
    }

    static setTranslation(language, key, value) {
        let languageObj = this.getLanguageFromIdentifier(language);
        return Localization.findOrCreate({
            where: {
                key,
                // @ts-ignore
                LanguageId: languageObj.id
            },
            defaults: {
                value
            }
        });
    }
}
