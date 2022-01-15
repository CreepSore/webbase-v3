/* eslint-disable no-unused-vars */
import path from "path";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Version from "../../models/Version.js";
import Utils from "../../service/Utils.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import Permission from "../core-authentication/models/Permission.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class CoreDashboard extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
    async onStartCliApplication(params) {}

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {}

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await Permission.create({
            name: "CORE.DASHBOARD.VIEW",
            description: "View the core dashboard"
        });

        await Version.create({
            name: this.getMetadata().name,
            version: this.getMetadata().version
        });
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {ExpressParams} params */
    async beforeExpressStart(params) { }

    /** @param {ExpressParams} params */
    async afterExpressStart(params) { }

    /** @param {ExpressParams} params */
    async expressStart(params) {
        params.app.get("/core.dashboard/", ExpressRouteWrapper.create((req, res) => {
            res.send(Utils.renderDefaultReactPage("/compiled/core.dashboard/main.js", {
                title: "Dashboard"
            }));
        }, {
            permissions: ["CORE.DASHBOARD.VIEW"],
            onInvalidPermissions: (req, res) => {
                res.redirect("/core.authentication/login?redirectTo=" + encodeURIComponent(req.originalUrl));
            }
        }));
    }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig(params) {
        return {
            entry: {
                "core.dashboard/main.js": path.join(this.getPluginDir(), "web", "src", "index", "main.jsx")
            }
        };
    }

    getConfigModel() {
        return {};
    }

    getPriority() {return 1000;}
    async onLoad() { }
    async onUnload() {}
}
