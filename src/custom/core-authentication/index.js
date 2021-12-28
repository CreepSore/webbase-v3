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

import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";

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

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        const permAll = await Permission.create({
            name: "CORE.ALL",
            description: "Pseudopermission for everything"
        });

        const permLogin = await Permission.create({
            name: "CORE.AUTHENTICATION.LOGIN",
            description: "Enables userlogin"
        });

        const permRegister = await Permission.create({
            name: "CORE.AUTHENTICATION.REGISTER",
            description: "Enables registration"
        });

        await PermissionGroup.create({
            name: "Anonymous",
            description: "Gets used if the user is not logged in"
        }).then(async group => {
            // @ts-ignore
            group.addPermission(permLogin);
            // @ts-ignore
            group.addPermission(permRegister);
        });

        await PermissionGroup.create({
            name: "Default",
            description: "Default group for logged in users"
        }).then(async group => {});

        await PermissionGroup.create({
            name: "SuperAdmin",
            description: "Superadmin group"
        }).then(async group => {
            // @ts-ignore
            group.addPermission(permAll);
        });

        await Version.create({
            name: this.extensionInfo.name,
            version: this.extensionInfo.version
        });
    }


    /** @param {ExpressParams} params */
    async expressStart(params) {
        let {app} = params;
        app.use(async(req, res, next) => {
            // @ts-ignore
            if(!req.session.uid) return next();
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
        apiRouter.post("/login", ExpressRouteWrapper.create(ApiLogin, {permissions: ["CORE.AUTHENTICATION.LOGIN"]}));
        apiRouter.post("/logout", ExpressRouteWrapper.create(ApiLogout));
        apiRouter.post("/register", ExpressRouteWrapper.create(ApiRegister, {permissions: ["CORE.AUTHENTICATION.REGISTER"]}));

        // eslint-disable-next-line new-cap
        let viewRouter = express.Router();
        viewRouter.get("/", (req, res) => res.redirect("login"));
        viewRouter.get("/login", (req, res) => {
            if(res.locals.user) {
                res.redirect("/");
                return;
            }

            res.render(path.join(this.getPluginDir(), "web", "views", "react-page.ejs"), {
                scripts: ["/js/core.authentication/login.comp.js"]
            });
        });

        app.use("/api/core.authentication", apiRouter);
        app.use("/core.authentication", viewRouter);
    }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig() {
        return {
            entry: {
                "core.authentication/login": path.join(this.getPluginDir(), "web", "src", "login", "main.jsx")
            }
        };
    }

    getPriority() {return 999;}
    async onLoad() {
        this.extensionInfo = await this.getMetadata();
    }
    async onUnload() {}
}
