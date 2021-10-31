/* eslint-disable no-unused-vars */
import express from "express";
import * as uuid from "uuid";
import helmet from "helmet";
import expressSession from "express-session";

import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import KvpStorage from "../../service/KvpStorage.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class Core extends CustomerLogic {
    /** @type {CustomerLogicDependencies} */
    #dependencies;

    /** @param {import("../../service/customer-logic/types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {
        params.commandHandler.registerCommand("help", {
            help: "Prints all help",
            callback: (arg) => {
                let handler = params.commandHandler;
                arg.forEach(handlerName => {
                    if(!handler) return;
                    handler = handler.subHandler.get(handlerName);
                });

                if(!handler) {
                    console.log("ERROR", "Invalid command handler");
                    return;
                }

                console.log("INFO", `Hello, I'm the help page:\n${handler.getHelpText()}`);
            }
        });
    }

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupModels(params) {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeFirstInstall(params) {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStart(params) {
        let cfg = KvpStorage.instance.wrapper.getConfig();
        let {app} = params;

        app.use(helmet({
            contentSecurityPolicy: false
        }));

        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(express.raw());

        app.use(expressSession({
            secret: cfg.web.sessionSecret || uuid.v4(),
            saveUninitialized: true,        // This probably isn't EU compliant haha lmao
            resave: false
        }));

        app.use((req, res, next) => {
            console.log("WEBINFO", `Request: [${req.method}]@[${req.url}] from [${JSON.stringify(req.ips)}]; SessionData: [${JSON.stringify(req.session)}]; Body: ${JSON.stringify(req.body)}`);
            next();
        });
    }

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 1000;}
    async onLoad() {}
    async onUnload() {}
}
