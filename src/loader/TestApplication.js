import CustomerLogicFactory from "../service/customer-logic/CustomerLogicFactory.js";
import CustomerLogicHandler from "../service/customer-logic/CustomerLogicHandler.js";
import SequelizeLoader from "./logic-initializer/SequelizeLoader.js";
import ConfigModel from "../service/ConfigModel.js";
import KvpStorage from "../service/KvpStorage.js";

export default class TestApplication {
    async start() {
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

        await CustomerLogicFactory.createAndInitializeCustomerLogicHandler(false);
        await CustomerLogicHandler.instance.loadAllCustomerImplementations();
        await CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("onStartTestApplication");

        this.sequelizeLoader = new SequelizeLoader();
        await this.sequelizeLoader.start();

        let errors = await this.sequelizeLoader.checkDb();

        if(errors.length > 0) {
            console.log("CRITICAL", `Failed to load database. Please reinstall the DB: ${JSON.stringify(errors, null, 2)}`);
            await this.stop();
            return;
        }
    }

    async stop(force = false) {
        if(force) {
            console.log("Forcing exit ...");
            process.exit(0);
        }
        await CustomerLogicHandler.instance.unloadAllCustomerImplementations(true);
        await this.sequelizeLoader?.stop?.();
    }
}
