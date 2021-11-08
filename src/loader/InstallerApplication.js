import Version from "../models/Version.js";
import CustomerLogicHandler from "../service/customer-logic/CustomerLogicHandler.js";
import SequelizeLoader from "./logic-initializer/SequelizeLoader.js";

export default class InstallerApplication {
    #options;

    /**
     * @param {SequelizeLoader} loader
     */
    async runDropLogic(loader) {
        console.log("INFO", "Starting drop subfunction ...");

        await loader.sequelize.drop({
            logging: true
        });
    }

    /**
     * @param {SequelizeLoader} loader
     */
    async runSetupLogic(loader) {
        console.log("INFO", "Starting setup subfunction ...");

        await loader.doSync({
            alter: true,
            logging: true
        });

        console.log("INFO", "Installation finished, checking schema ...");
        let errors = await loader.checkDb();

        if(errors.length > 0) {
            console.log("ERROR", `Installation failed: ${JSON.stringify(errors, null, 2)}`);
        }

        if(!await Version.findOne({name: "DEFAULT"})) {
            console.log("INFO", "Executing first-install-hooks ...");
            await CustomerLogicHandler.instance.runAllCustomerLogicFunction("sequelizeFirstInstall", {sequelize: loader.sequelize});
        }
        else {
            await Version.findOrCreate({where: {name: "DEFAULT"}, defaults: {version: "3.0.0"}});
        }
    }

    /**
     * @param {import("./types").InstallerApplicationStartParams} options
     */
    async start(options = {}) {
        await CustomerLogicHandler.instance.loadAllCustomerImplementations();
        await CustomerLogicHandler.instance.runAllCustomerLogicFunction("onStartInstallerApplication");

        console.log("INFO", "Starting installer application ...");
        this.#options = options;

        console.log("INFO", "Initializing Sequelize ...");
        let loader = new SequelizeLoader();
        await loader.start();

        options.drop && await this.runDropLogic(loader);
        options.setup && await this.runSetupLogic(loader);

        console.log("INFO", "Installer application process finished.");
    }

    // eslint-disable-next-line no-unused-vars
    async stop(force = false) {
        return;
    }
}
