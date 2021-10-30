import fs from "fs";
import path from "path";

import CustomerLogicHandler from "./CustomerLogicHandler.js";

export default class CustomerLogicFactory {
    static async createAndInitializeCustomerLogicHandler(autoLoad = true) {
        let handler = new CustomerLogicHandler();
        let resolvedLogicPath = CustomerLogicFactory.getCustomerLogicPath();

        let files = fs.readdirSync(resolvedLogicPath);
        let toAwait = files
            .filter(x => fs.statSync(path.join(resolvedLogicPath, x)).isDirectory())
            .map(async pluginDirectory => {
                let finalPath = path.join(resolvedLogicPath, pluginDirectory, "index.js");
                if(!fs.existsSync(finalPath)) {
                    console.log("WARN", `No index.js found at [${finalPath}]`);
                    return;
                }

                try {
                    let LogicConstructor = (await import(finalPath)).default;
                    let logicInstance = new LogicConstructor();
                    await handler.registerCustomerLogic(logicInstance, false);
                }
                catch(error) {
                    console.log("ERROR", `An error occured while trying to load plugin at [${finalPath}]`);
                    console.log("ERROR", error);
                    console.log("ERROR", error.stack);
                }
            });

        await Promise.all(toAwait);

        autoLoad && await handler.loadAllCustomerImplementations();
        return handler;
    }

    static getCustomerLogicPath() {
        let resolvedPath = path.resolve(".", "src", "custom");
        fs.existsSync(resolvedPath) || fs.mkdirSync(resolvedPath);
        return resolvedPath;
    }
}
