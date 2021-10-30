import CustomerLogicHandler from "../service/customer-logic/CustomerLogicHandler.js";
import ExpressLoader from "./logic-initializer/ExpressLoader.js";
import SequelizeLoader from "./logic-initializer/SequelizeLoader.js";

export default class MainApplication {
    #options;

    /**
     * @param {import("./types").MainApplicationStartOptions} options
     */
    async start(options = {}) {
        this.#options = options;
        await CustomerLogicHandler.instance.loadAllCustomerImplementations();
        await CustomerLogicHandler.instance.runAllCustomerLogicFunction("onStartMainApplication");

        this.sequelizeLoader = new SequelizeLoader();
        await this.sequelizeLoader.start();

        let errors = await this.sequelizeLoader.checkDb();

        if(errors.length > 0) {
            console.log("CRITICAL", `Failed to load database. Please reinstall the DB: ${JSON.stringify(errors, null, 2)}`);
            await this.stop();
            return;
        }

        this.expressLoader = new ExpressLoader();
        this.expressLoader.start();
    }

    async stop(force = false) {
        if(force) {
            console.log("Forcing exit ...");
            process.exit(0);
        }
        await this.expressLoader?.stop?.();
        await this.sequelizeLoader?.stop?.();
    }
}
