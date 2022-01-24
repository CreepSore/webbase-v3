import minimist from "minimist";

import MainApplication from "./loader/MainApplication.js";
import InstallerApplication from "./loader/InstallerApplication.js";
import CliApplication from "./loader/CliApplication.js";
import CustomerLogicFactory from "./service/customer-logic/CustomerLogicFactory.js";
import CustomerLogicHandler from "./service/customer-logic/CustomerLogicHandler.js";
import Logger from "./service/Logger.js";
import KvpStorage from "./service/KvpStorage.js";
import ConfigModel from "./service/ConfigModel.js";

async function main() {
    /** @type {ConfigModel} */
    let cfg;
    try {
        cfg = ConfigModel.import(ConfigModel.configPath);
        KvpStorage.instance.setItem(KvpStorage.defaultKeys.config, cfg);
    }
    catch(err) {
        ConfigModel.exportDefault(ConfigModel.templatePath);
        console.log("ERROR", `Failed to load config: ${err}`);
        return;
    }

    Logger.replaceConsoleLog(cfg.utils.unicodeLogging);

    // Lol
    let cfgCopy = JSON.parse(JSON.stringify(cfg));
    let customerLogic = await CustomerLogicFactory.createAndInitializeCustomerLogicHandler(false);
    CustomerLogicHandler.instance.sortedCustomerLogic.forEach(logic => {
        let model = logic.getConfigModel();
        if(!cfgCopy.extensions) {
            cfgCopy.extensions = {};
        }
        cfgCopy.extensions[logic.getMetadata().name] = model || {};
    });
    ConfigModel.exportModel(ConfigModel.templatePath, cfgCopy);


    let args = [...process.argv];
    let parsedArgs = minimist(args.slice(2), {
        alias: {
            install: "i",
            drop: "d",
            setup: "s",
            cli: "c"
        },
        "boolean": ["install", "drop", "setup", "cli"],
        string: []
    });
    let app;
    let exitHandler = async() => {
        try {
            await app.stop();
            await customerLogic.unloadAllCustomerImplementations(true);
        }
        catch (err) {
            console.log("ERROR", "Safe shutdown failed. Forcing exit ...");
        }
        finally {
            process.exit(0);
        }
    };

    process.on("SIGINT", exitHandler);
    process.on("SIGTERM", exitHandler);
    process.on("SIGUSR1", exitHandler);
    process.on("SIGUSR2", exitHandler);

    if(parsedArgs.install) {
        app = new InstallerApplication();
        await app.start({
            drop: parsedArgs.drop,
            setup: parsedArgs.setup
        });
    }
    else if(parsedArgs.cli) {
        app = new CliApplication();
        await app.start({parsedArgs});
    }
    else {
        app = new MainApplication();
        await app.start();
    }
}

main();
