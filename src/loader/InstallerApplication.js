import CustomerLogicHandler from "../service/customer-logic/CustomerLogicHandler.js";
import SequelizeLoader from "./logic-initializer/SequelizeLoader.js";

export default class InstallerApplication {
    #options;

    /**
     * @param {SequelizeLoader} loader
     */
    async runDropLogic(loader) {
        console.log("INFO", "Starting drop subfunction ...");

        await loader.sequelize.drop();
    }

    /**
     * @param {SequelizeLoader} loader
     */
    async runSetupLogic(loader) {
        console.log("INFO", "Starting setup subfunction ...");

        await loader.doSync({
            alter: true
        });

        console.log("INFO", "Installation finished, checking schema ...");
        let errors = await loader.checkDb();

        if(errors.length > 0) {
            console.log("ERROR", `Installation failed: ${JSON.stringify(errors, null, 2)}`);
        }

        console.log("INFO", "Executing first-install-hooks ...");
        await CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("sequelizeFirstInstall", {sequelize: loader.sequelize});
    }

    /**
     * @param {import("./types").InstallerApplicationStartParams} options
     */
    async start(options = {}) {
        await CustomerLogicHandler.instance.loadAllCustomerImplementations();
        await CustomerLogicHandler.instance.runAllCustomerLogicFunctionDependencyFirst("onStartInstallerApplication");

        console.log("INFO", "Starting installer application ...");
        this.#options = options;

        console.log("INFO", "Initializing Sequelize ...");
        let loader = new SequelizeLoader(true);
        await loader.start();

        if(options.drop){
            console.log("INFO", "Dropping old Schema ...");
            await this.runDropLogic(loader);
        }
        if(options.setup) {
            console.log("INFO", "Installing Schema ...");
            await this.runSetupLogic(loader);
        }

        console.log("INFO", "Installer application process finished.");
    }

    // eslint-disable-next-line no-unused-vars
    async stop(force = false) {
        return;
    }
}
