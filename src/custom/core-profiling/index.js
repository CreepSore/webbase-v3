/* eslint-disable no-unused-vars */
import path from "path";

import express from "express";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Profiler from "../../service/Profiler.js";
import Version from "../../models/Version.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 */

export default class CoreProfiling extends CustomerLogic {
    /** @param {import("../../service/customer-logic/types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {}

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {}

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await Version.create({
            name: this.getMetadata().name,
            version: this.getMetadata().version
        });
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {ExpressParams} params */
    async expressStart(params) {
        let {app} = params;


        // eslint-disable-next-line new-cap
        let apiRouter = express.Router();
        apiRouter.get("/", async(req, res) => {
            res.json({
                success: true,
                data: Profiler.instance.measurementList
            });
        });

        // eslint-disable-next-line new-cap
        let viewRouter = express.Router();
        viewRouter.get("/", ExpressRouteWrapper.create(async(req, res) => {
            res.render(path.join(this.getPluginDir(), "web", "views", "react-page.ejs"), {
                scripts: ["/js/core.profiling/profiling.comp.js"]
            });
        }, {
            permissions: []
        }));

        app.use("/core.profiling", viewRouter);
        app.use("/api/core.profiling", apiRouter);
    }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig() {
        return {
            entry: {
                "core.profiling/profiling": path.join(this.getPluginDir(), "web", "src", "main.jsx")
            }
        };
    }

    getPriority() {return 1000;}
    async onLoad() {}
    async onUnload() {}
}
