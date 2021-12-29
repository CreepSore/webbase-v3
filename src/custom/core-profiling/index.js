/* eslint-disable no-unused-vars */
import path from "path";

import express from "express";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Profiler from "../../service/Profiler.js";
import Version from "../../models/Version.js";
import ExpressRouteWrapper from "../../service/ExpressRouteWrapper.js";
import Utils from "../../service/Utils.js";
import KvpStorage from "../../service/KvpStorage.js";

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
        apiRouter.get("/measurements", ExpressRouteWrapper.create(async(req, res) => {
            res.json({
                success: true,
                data: Profiler.instance.measurementList
            });
        }, {
            permissions: ["CORE.PROFILING.VIEW"]
        }));

        apiRouter.get("/enabled", ExpressRouteWrapper.create(async(req, res) => {
            res.json({
                success: true,
                data: KvpStorage.instance.wrapper.getConfig().utils.runProfiling
            });
        }, {
            permissions: ["CORE.PROFILING.VIEW"]
        }));

        app.use("/api/core.profiling", apiRouter);

        // eslint-disable-next-line new-cap
        let viewRouter = express.Router();

        viewRouter.get("/", ExpressRouteWrapper.create(async(req, res) => {
            res.send(Utils.renderDefaultReactPage("/js/core.profiling/profiling.comp.js", {
                title: "Profiling"
            }));
        }, {
            permissions: ["CORE.PROFILING.VIEW"],
            onInvalidPermissions: (req, res) => {
                res.redirect("/core.authentication/login?redirectTo=%2Fcore.profiling%2F");
            }
        }));

        app.use("/core.profiling", viewRouter);
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
