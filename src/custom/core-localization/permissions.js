let permissions = {
    core_localization_get_languages: {
        key: "CORE.LOCALIZATION.GET_LANGUAGES",
        description: "Permission to get languages",
        anonymous: true,
        "default": true
    },
    core_localization_create_language: {
        key: "CORE.LOCALIZATION.CREATE_LANGUAGE",
        description: "Permission to create languages"
    },
    core_localization_get_translation: {
        key: "CORE.LOCALIZATION.GET_TRANSLATION",
        description: "Permission to get translations",
        anonymous: true,
        "default": true
    },
    core_localization_get_translation_formatted: {
        key: "CORE.LOCALIZATION.GET_TRANSLATION_FORMATTED",
        description: "Permission to get formatted translations",
        anonymous: true,
        "default": true
    },
    core_localization_set_translation: {
        key: "CORE.LOCALIZATION.SET_TRANSLATION",
        description: "Permission to set translations"
    },
    core_localization_get_missing: {
        key: "CORE.LOCALIZATION.GET_MISSING",
        description: "Permission to get missing translations"
    },
    core_localization_get_all_translations: {
        key: "CORE.LOCALIZATION.GET_ALL_TRANSLATIONS",
        description: "Permission to get all translations"
    },
    core_localization_edit_translation: {
        key: "CORE.LOCALIZATION.EDIT_TRANSLATION",
        description: "Permission to edit translations"
    }
};

export default permissions;
