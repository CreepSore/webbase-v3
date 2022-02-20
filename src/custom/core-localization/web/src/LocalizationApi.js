/**
 * @typedef {Object} Exception
 * @property {{code: string}} info
 * @property {string} text
 */

export default class LocalizationApi {
    /**
     * @throws {Exception}
     */
    static async getLanguages() {
        let result = await fetch("/api/core.localization/languages")
            .then(response => response.json());

        if(!result.success) throw result.error;

        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async getAllTranslations() {
        let result = await fetch("/api/core.localization/translation/all")
            .then(response => response.json());

        if(!result.success) throw result.error;

        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async getMissingTranslations() {
        let result = await fetch("/api/core.localization/translation/missing")
            .then(res => res.json());

        if(!result.success) throw result.error;

        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async getLanguageById(id) {
        let result = await fetch(`/api/core.localization/language/fromId/${id}`)
            .then(response => response.json());

        if(!result.success) throw result.error;

        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async getTranslation(langCode, transKey, fallback = true) {
        let result = await fetch(`/api/core.localization/translation/${langCode}/${transKey}`)
            .then(response => response.json());

        if(!result.success) throw result.error;

        return result.data || (fallback ? transKey : null);
    }

    /**
     * @throws {Exception}
     */
    static async getFormattedTranslation(langCode, transKey, replacements = {}, fallback = true) {
        let result = await fetch(`/api/core.localization/translation/${langCode}/${transKey}`, {
            method: "POST",
            body: JSON.stringify(replacements),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json());

        if(!result.success) throw result.error;

        return result.data || (fallback ? transKey : null);
    }

    /**
     * @throws {Exception}
     */
    static async setTranslation(langCode, transKey, translation) {
        let result = await fetch(`/api/core.localization/translation/${langCode}/${transKey}`, {
            method: "PUT",
            body: JSON.stringify({translation}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());

        if(!result.success) throw result.error;

        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async massTranslate(langCode, translations = [], fallback = true) {
        let translated = (await Promise.all(
            translations.map(translation => this.getTranslation(langCode, translation))
        ));

        let result = [];
        translated.forEach((value, index) => {
            result[translations[index]] = value || (fallback ? translations[index] : null);
        });

        return result;
    }

    static async getLanguage() {
        return fetch("/api/core/settings/defaultLanguage").then(res => res.json());
    }
}
