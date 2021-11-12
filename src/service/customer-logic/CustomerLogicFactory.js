import fs from "fs";
import path from "path";
import os from "os";

import CustomerLogicHandler from "./CustomerLogicHandler.js";

export default class CustomerLogicFactory {
    static async createAndInitializeCustomerLogicHandler(autoLoad = true) {
        let handler = new CustomerLogicHandler();
        let resolvedLogicPath = CustomerLogicFactory.getCustomerLogicPath();

        let files = fs.readdirSync(resolvedLogicPath);
        let toAwait = files
            .filter(x => fs.statSync(path.join(resolvedLogicPath, x)).isDirectory())
            .map(async pluginDirectory => {
                let resolvedPluginDir = path.resolve(resolvedLogicPath, pluginDirectory);
                let metaPath = path.join(resolvedPluginDir, "extension.json");

                if(!fs.existsSync(metaPath)) {
                    return;
                }

                try {
                    let extensionData = JSON.parse(String(fs.readFileSync(metaPath)));
                    if(extensionData.enabled === false) return;
                    let finalPath = path.join(resolvedPluginDir, extensionData.entrypoint || "index.js");
                    if(!fs.existsSync(finalPath)) {
                        throw new Error(`Entrypoint not found at [${finalPath}]`);
                    }

                    let LogicConstructor = (await import(os.platform() === "win32" ? `file:///${finalPath}` : finalPath)).default;
                    let logicInstance = new LogicConstructor();
                    await handler.registerCustomerLogic(logicInstance, false, {
                        pluginDir: resolvedPluginDir,
                        metadata: extensionData
                    });
                }
                catch(error) {
                    console.log("ERROR", `An error occured while trying to load plugin at [${resolvedPluginDir}]`);
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
