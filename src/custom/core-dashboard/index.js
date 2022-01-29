/* eslint-disable no-unused-vars */
import path from "path";

import express from "express";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import CustomerLogicHandler from "../../service/customer-logic/CustomerLogicHandler.js";
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
        let apiRouter = express.Router();
        let viewRouter = express.Router();

        apiRouter.get("/extensions", (req, res) => {
            let logic = CustomerLogicHandler.instance.sortedCustomerLogic.map(ext => {
                return {
                    name: ext.getMetadata().name,
                    dependencies: ext.dependencies,
                    loading: ext.loading,
                    loaded: ext.loaded
                };
            });
            res.json(logic);
        });

        viewRouter.get("/", ExpressRouteWrapper.create((req, res) => {
            res.send(Utils.renderDefaultReactPage("/compiled/core.dashboard/main.js", {
                title: "Dashboard"
            }));
        }, {
            permissions: ["CORE.DASHBOARD.VIEW"],
            onInvalidPermissions: (req, res) => {
                res.redirect(this.getApi("Core.Authentication").constructRedirectUrl(req.originalUrl));
            }
        }));

        viewRouter.get("/logout", (req, res) => {
            res.redirect(this.getApi("Core.Authentication").constructLogoutUrl());
        });

        params.app.use("/core.dashboard", viewRouter);
        params.app.use("/api/core.dashboard", apiRouter);
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

    exposeApi() {
        return {};
    }

    getPriority() {return 1000;}
    async onLoad() { }
    async onUnload() {}
}
