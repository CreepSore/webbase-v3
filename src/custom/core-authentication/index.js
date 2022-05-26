/* eslint-disable no-unused-vars */
import path from "path";

import express from "express";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Permission from "./models/Permission.js";
import PermissionGroup from "./models/PermissionGroup.js";
import User from "./models/User.js";
import PermissionGroupPermissions from "./models/PermissionGroupPermissions.js";
import Version from "../../models/Version.js";
import ApiKey from "./models/ApiKey.js";

import UserCommandHandler from "./cli/UserCommandHandler.js";
import PermissionCommandHandler from "./cli/PermissionCommandHandler.js";
import PermissionGroupCommandHandler from "./cli/PermissionGroupCommandHandler.js";
import ApiKeyCommandHandler from "./cli/ApiKeyCommandHandler.js";

import ApiLogin from "./api/login.js";
import ApiLogout from "./api/logout.js";
import ApiRegister from "./api/register.js";
import ApiUpdateUserdata from "./api/updateUserData.js";
import ApiGetUsers from "./api/getUsers.js";
import ApiDeleteUser from "./api/deleteUser.js";
import ApiGetPermGroups from "./api/getPermissionGroups.js";
import ApiNewPermGroup from "./api/createPermgroup.js";
import ApiMyPermissions from "./api/myPermissions.js";
import ApiGetPermissions from "./api/getPermissions.js";
import ApiSetPermGroupPerms from "./api/setPermgroupPerms.js";
import ApiImpersonateUser from "./api/impersonate.js";
import ApiLogonInfo from "./api/logonInfo.js";

import permissions from "./permissions.js";

import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import Utils from "../../service/Utils.js";
import PermissionService from "./service/PermissionService.js";
import UserService from "./service/UserService.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class CoreUsermgmt extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
    async onStartCliApplication(params) {
        params.commandHandler.registerSubHandler("user", new UserCommandHandler());
        params.commandHandler.registerSubHandler("perm", new PermissionCommandHandler());
        params.commandHandler.registerSubHandler("permgroup", new PermissionGroupCommandHandler());
        params.commandHandler.registerSubHandler("apikey", new ApiKeyCommandHandler());
    }

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Permission.initialize(params.sequelize);
        PermissionGroup.initialize(params.sequelize);
        PermissionGroupPermissions.initialize(params.sequelize);
        User.initialize(params.sequelize);
        ApiKey.initialize(params.sequelize);
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {
        User.belongsTo(PermissionGroup);
        PermissionGroup.hasMany(User);

        PermissionGroup.belongsToMany(Permission, {through: {model: PermissionGroupPermissions, unique: false}});
        Permission.belongsToMany(PermissionGroup, {through: {model: PermissionGroupPermissions, unique: false}});

        User.hasMany(ApiKey);
        ApiKey.belongsTo(User);

        PermissionGroup.hasMany(ApiKey);
        ApiKey.belongsTo(PermissionGroup);
    }

    /**
     * @param {Object<string, {key: string, description: string, anonymous?: boolean, default?: boolean, superadmin?: boolean}>} object
     * @memberof CoreUsermgmt
     */
    async setupPermissionsByObject(object) {
        let [anonymousGroup, defaultGroup, superadminGroup] = await Promise.all([
            PermissionService.getAnonymousPermissionGroup(),
            PermissionService.getDefaultPermissionGroup(),
            PermissionService.getSuperAdminPermissionGroup()
        ]);

        return Promise.all(Object.entries(object).map(async([name, data]) => {
            return await Permission.create({name: data.key, data})
                .then(perm => {
                    if(data.anonymous) {
                        // @ts-ignore
                        anonymousGroup.addPermission(perm);
                    }

                    if(data.default) {
                        // @ts-ignore
                        defaultGroup.addPermission(perm);
                    }

                    if(data.superadmin) {
                        // @ts-ignore
                        superadminGroup.addPermission(perm);
                    }
                }).catch(() => {});
        }));
    }

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await PermissionGroup.findOrCreate({where: {name: "Anonymous", description: "Anonymous users"}});
        await PermissionGroup.findOrCreate({where: {name: "Default", description: "Default users"}});
        await PermissionGroup.findOrCreate({where: {name: "Superadmin", description: "Superadmin users"}});

        await this.setupPermissionsByObject(permissions);

        let userCfg = this.getConfig("defaultSuperuser");
        if(userCfg?.create) {
            try {
                let user = await UserService.registerUser(userCfg.username, userCfg.password, userCfg.email);
                // @ts-ignore
                user.active = true;
                await user.save();
                // @ts-ignore
                await UserService.setPermissionGroup(user.id, "Superadmin");
            }
            catch { /** lol */}
        }

        await Version.create({
            name: this.extensionInfo.name,
            version: this.extensionInfo.version
        }).catch(() => {});
    }


    /** @param {ExpressParams} params */
    async expressStart(params) {
        let {app} = params;
        app.use(async(req, res, next) => {
            const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const autologinEntry = (this.getConfig().autologin || []).find(entry => entry.host === ipAddress);
            // @ts-ignore
            if(autologinEntry && !req.session?.uid) {
                const foundUser = await User.findOne({where: {username: autologinEntry.username}});
                if(!foundUser) {
                    console.log("WARN", `Failed to Autologin ${ipAddress} for user ${autologinEntry.username}`);
                }

                // @ts-ignore
                req.session.uid = foundUser.id;
                console.log("WARN", `Automatically logged in ${ipAddress} for user ${autologinEntry.username}`);
            }

            // @ts-ignore
            if(!req.session?.uid) return next();
            // @ts-ignore
            let user = await User.findByPk(req.session.uid);

            if(!user) {
                // @ts-ignore
                delete req.session.uid;
                return next();
            }

            res.locals.user = user;

            next();
        });

        // eslint-disable-next-line new-cap
        let apiRouter = express.Router();
        apiRouter.post("/login", ExpressRouteWrapper.create(ApiLogin, {
            permissions: [permissions.core_authentication_login.key]
        }));
        apiRouter.get("/logout", ExpressRouteWrapper.create(ApiLogout));
        apiRouter.get("/logonInfo", ExpressRouteWrapper.create(ApiLogonInfo, {}));
        apiRouter.post("/register", ExpressRouteWrapper.create(ApiRegister, {
            permissions: [permissions.core_authentication_register.key]
        }));
        apiRouter.get("/user/me/permissions", ExpressRouteWrapper.create(ApiMyPermissions, {
            permissions: [permissions.core_authentication_user_me_permissions_get.key]
        }));
        apiRouter.put("/user/:uid", ExpressRouteWrapper.create(ApiUpdateUserdata, {
            permissions: [permissions.core_authentication_edit_user_basic.key]
        }));
        apiRouter.delete("/user/:uid", ExpressRouteWrapper.create(ApiDeleteUser, {
            permissions: [permissions.core_authentication_user_delete.key]
        }));
        apiRouter.post("/user/:uid/impersonate", ExpressRouteWrapper.create(ApiImpersonateUser, {
            permissions: [permissions.core_authentication_impersonate.key]
        }));
        apiRouter.get("/users", ExpressRouteWrapper.create(ApiGetUsers, {
            permissions: [permissions.core_authentication_users_get.key]
        }));
        apiRouter.get("/permGroups", ExpressRouteWrapper.create(ApiGetPermGroups, {
            permissions: [permissions.core_authentication_permgroups_get.key]
        }));
        apiRouter.post("/permGroup/new", ExpressRouteWrapper.create(ApiNewPermGroup, {
            permissions: [permissions.core_authentication_permgroups_new.key]
        }));
        apiRouter.post("/permGroups/:id", ExpressRouteWrapper.create(ApiSetPermGroupPerms, {
            permissions: [permissions.core_authentication_permgroups_update.key]
        }));
        apiRouter.get("/permissions", ExpressRouteWrapper.create(ApiGetPermissions, {
            permissions: [permissions.core_authentication_permissions_get.key]
        }));

        // eslint-disable-next-line new-cap
        let viewRouter = express.Router();
        viewRouter.get("/", (req, res) => res.redirect("login"));
        viewRouter.get("/login", ExpressRouteWrapper.create((req, res) => {
            if(res.locals.user) {
                res.redirect("/");
                return;
            }

            res.send(Utils.renderDefaultReactPage("/compiled/core.authentication/login.js", {
                title: "Login"
            }));
        }, {
            permissions: [permissions.core_authentication_login.key],
            onInvalidPermissions: (req, res) => {
                res.redirect("/");
            }
        }));

        app.use("/api/core.authentication", apiRouter);
        app.use("/core.authentication", viewRouter);
    }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig() {
        return {
            entry: {
                "core.authentication/login.js": path.join(this.getPluginDir(), "web", "src", "login", "main.jsx")
            }
        };
    }

    getConfigModel() {
        return {
            defaultSuperuser: {
                create: false,
                username: "",
                password: ""
            },
            autologin: [
                {enabled: false, host: "127.0.0.1", username: "username"}
            ]
        };
    }

    exposeApi() {
        return {
            constructRedirectUrl: (redirectTo = "") => {
                let redirectUrl = "/core.authentication/login";
                if(redirectTo) {
                    redirectUrl = `${redirectUrl}?redirectTo=${encodeURIComponent(redirectTo)}`;
                }
                return redirectUrl;
            },
            constructLogoutUrl: () => {
                return "/api/core.authentication/logout";
            },
            setupPermissionsByObject: this.setupPermissionsByObject
        };
    }

    getPriority() {return 999;}
    async onLoad() {
        this.extensionInfo = await this.getMetadata();
    }
    async onUnload() {}
}
