/* eslint-disable no-unused-vars */
import fs from "fs";
import path from "path";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Permission from "./models/Permission.js";
import PermissionGroup from "./models/PermissionGroup.js";
import User from "./models/User.js";

import UserCommandHandler from "./cli/UserCommandHandler.js";
import PermissionCommandHandler from "./cli/PermissionCommandHandler.js";
import PermissionGroupCommandHandler from "./cli/PermissionGroupCommandHandler.js";

import ApiLogin from "./api/login.js";
import ApiRegister from "./api/register.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import PermissionGroupPermissions from "./models/PermissionGroupPermissions.js";
import Version from "../../models/Version.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class CoreUsermgmt extends CustomerLogic {
    /** @param {import("../../service/customer-logic/types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {
        params.commandHandler.registerSubHandler("user", new UserCommandHandler());
        params.commandHandler.registerSubHandler("perm", new PermissionCommandHandler());
        params.commandHandler.registerSubHandler("permgroup", new PermissionGroupCommandHandler());
    }

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Permission.initialize(params.sequelize);
        PermissionGroup.initialize(params.sequelize);
        PermissionGroupPermissions.initialize(params.sequelize);
        User.initialize(params.sequelize);
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupRelation(params) {
        User.belongsTo(PermissionGroup);
        PermissionGroup.hasMany(User);

        PermissionGroup.belongsToMany(Permission, {through: {model: PermissionGroupPermissions, unique: false}});
        Permission.belongsToMany(PermissionGroup, {through: {model: PermissionGroupPermissions, unique: false}});
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        const permAll = await Permission.create({
            name: "CORE.USERMGMT.ALL",
            description: "Pseudopermission for everything"
        });

        const permLogin = await Permission.create({
            name: "CORE.USERMGMT.LOGIN",
            description: "Enables userlogin"
        });

        const permRegister = await Permission.create({
            name: "CORE.USERMGMT.REGISTER",
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


    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStart(params) {
        params.app.use(async(req, res, next) => {
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

        params.app.post("/api/usermgmt/login", ExpressRouteWrapper.create(ApiLogin, {permissions: ["CORE.USERMGMT.LOGIN"]}));
        params.app.post("/api/usermgmt/register", ExpressRouteWrapper.create(ApiRegister, {permissions: ["CORE.USERMGMT.REGISTER"]}));
    }

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 999;}
    async onLoad() {
        this.extensionInfo = JSON.parse(String(fs.readFileSync(path.resolve(this.dependencies.extensionsPath, "core-usermgmt", "extension.json"))));
    }
    async onUnload() {}
}
