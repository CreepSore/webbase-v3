let permissions = {
    "CORE.ALL": {
        key: "CORE.ALL",
        description: "Pseudopermission for everything",
        superadmin: true
    },
    "CORE.AUTHENTICATION.LOGIN": {
        key: "CORE.AUTHENTICATION.LOGIN",
        description: "Enables User Logon",
        anonymous: true
    },
    "CORE.AUTHENTICATION.REGISTER": {
        key: "CORE.AUTHENTICATION.REGISTER",
        description: "Enables User Registration",
        anonymous: true
    },
    "CORE.AUTHENTICATION.EDIT.USER.BASIC": {
        key: "CORE.AUTHENTICATION.EDIT.USER.BASIC",
        description: "Enables User Basic Information Editing",
        "default": true
    },
    "CORE.AUTHENTICATION.EDIT.USER.ADVANCED": {
        key: "CORE.AUTHENTICATION.EDIT.USER.ADVANCED",
        description: "Enables User Advanced Information Editing"
    },
    "CORE.AUTHENTICATION.USER.DELETE": {
        key: "CORE.AUTHENTICATION.USER.DELETE",
        description: "Enables User Deletion"
    },
    "CORE.AUTHENTICATION.USERS.GET": {
        key: "CORE.AUTHENTICATION.USERS.GET",
        description: "Enables User List Retrieval"
    },
    "CORE.AUTHENTICATION.USER.ME.PERMISSIONS.GET": {
        key: "CORE.AUTHENTICATION.USER.ME.PERMISSIONS.GET",
        description: "Enables User Permissions Retrieval of currently logged on user",
        anonymous: true,
        "default": true
    },
    "CORE.AUTHENTICATION.PERMGROUPS.GET": {
        key: "CORE.AUTHENTICATION.PERMGROUPS.GET",
        description: "Enables Permission Group List Retrieval"
    },
    "CORE.AUTHENTICATION.PERMGROUPS.NEW": {
        key: "CORE.AUTHENTICATION.PERMGROUPS.NEW",
        description: "Enables Permission Group Creation"
    },
    "CORE.AUTHENTICATION.PERMGROUPS.UPDATE": {
        key: "CORE.AUTHENTICATION.PERMGROUPS.UPDATE",
        description: "Enables Permission Group Update"
    },
    "CORE.AUTHENTICATION.PERMISSIONS.GET": {
        key: "CORE.AUTHENTICATION.PERMISSIONS.GET",
        description: "Enables Permission List Retrieval"
    }
};

export default permissions;
