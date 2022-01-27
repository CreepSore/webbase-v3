let permissions = {
    core_all: {
        key: "CORE.ALL",
        description: "Pseudopermission for everything",
        superadmin: true
    },
    core_authentication_login: {
        key: "CORE.AUTHENTICATION.LOGIN",
        description: "Enables User Logon",
        anonymous: true
    },
    core_authentication_register: {
        key: "CORE.AUTHENTICATION.REGISTER",
        description: "Enables User Registration",
        anonymous: true
    },
    core_authentication_edit_user_basic: {
        key: "CORE.AUTHENTICATION.EDIT.USER.BASIC",
        description: "Enables User Basic Information Editing",
        "default": true
    },
    core_authentication_edit_user_advanced: {
        key: "CORE.AUTHENTICATION.EDIT.USER.ADVANCED",
        description: "Enables User Advanced Information Editing"
    },
    core_authentication_user_delete: {
        key: "CORE.AUTHENTICATION.USER.DELETE",
        description: "Enables User Deletion"
    },
    core_authentication_users_get: {
        key: "CORE.AUTHENTICATION.USERS.GET",
        description: "Enables User List Retrieval"
    },
    core_authentication_user_me_permissions_get: {
        key: "CORE.AUTHENTICATION.USER.ME.PERMISSIONS.GET",
        description: "Enables User Permissions Retrieval of currently logged on user",
        anonymous: true,
        "default": true
    },
    core_authentication_permgroups_get: {
        key: "CORE.AUTHENTICATION.PERMGROUPS.GET",
        description: "Enables Permission Group List Retrieval"
    },
    core_authentication_permgroups_new: {
        key: "CORE.AUTHENTICATION.PERMGROUPS.NEW",
        description: "Enables Permission Group Creation"
    },
    core_authentication_permgroups_update: {
        key: "CORE.AUTHENTICATION.PERMGROUPS.UPDATE",
        description: "Enables Permission Group Update"
    },
    core_authentication_permissions_get: {
        key: "CORE.AUTHENTICATION.PERMISSIONS.GET",
        description: "Enables Permission List Retrieval"
    },
    core_authentication_impersonate: {
        key: "CORE.AUTHENTICATION.IMPERSONATE",
        description: "Enables User Impersonation"
    }
};

export default permissions;
