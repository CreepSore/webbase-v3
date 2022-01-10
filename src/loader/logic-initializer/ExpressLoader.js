import express from "express";
import CustomerLogicHandler from "../../service/customer-logic/CustomerLogicHandler.js";

import KvpStorage from "../../service/KvpStorage.js";

export default class ExpressLoader {
    constructor() {
        this.app = express();
        KvpStorage.instance.setItem(KvpStorage.defaultKeys.express, this.app);
    }

    async start() {
        let cfg = KvpStorage.instance.wrapper.getConfig();
        CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("beforeExpressStart", {app: this.app});
        CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("expressStart", {app: this.app});
        CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("afterExpressStart", {app: this.app});
        this.server = this.app.listen(cfg.web.port, cfg.web.host);
    }

    async stop() {
        CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("expressStop", {app: this.app});
        this.server.close();
    }
}
