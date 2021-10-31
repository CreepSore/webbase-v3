/* eslint-disable no-unused-vars */
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

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class CoreUsermgmt extends CustomerLogic {
    /** @type {CustomerLogicDependencies} */
    #dependencies;

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

        await PermissionGroup.create({
            name: "Anonymous",
            description: "Gets used if the user is not logged in"
        }).then(async group => {
            // @ts-ignore
            group.addPermission(permLogin);
        });

        await PermissionGroup.create({
            name: "Default",
            description: "Default group for logged in users"
        }).then(async group => {
            // @ts-ignore
            group.addPermission(permLogin);
        });

        await PermissionGroup.create({
            name: "SuperAdmin",
            description: "Superadmin group"
        }).then(async group => {
            // @ts-ignore
            group.addPermission(permAll);
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

        params.app.post("/api/usermgmt/login", ApiLogin);
        params.app.post("/api/usermgmt/login", ApiRegister);

        params.app.get("/test", ExpressRouteWrapper.create((req, res, next) => {
            res.send("ok").end();
        }, {
            permissions: ["CORE.USERMGMT.LOGIN"],
            onInvalidPermissions(req, res, next) {
                res.send("bruh").end();
            }
        }));
    }

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 999;}
    async onLoad() {}
    async onUnload() {}
}
