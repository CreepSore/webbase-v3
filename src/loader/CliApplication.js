import CommandHandler from "../service/command-handler/CommandHandler.js";
import CustomerLogicHandler from "../service/customer-logic/CustomerLogicHandler.js";
import SequelizeLoader from "./logic-initializer/SequelizeLoader.js";

export default class CliApplication {
    #options;

    /**
     * @param {import("./types").CliApplicationStartParams} options
     */
    async start(options) {
        this.#options = options;
        let mainCommandHandler = new CommandHandler();

        await CustomerLogicHandler.instance.loadAllCustomerImplementations();

        let loader = new SequelizeLoader();
        await loader.start();

        await CustomerLogicHandler.instance.runAllCustomerLogicFunction("onStartCliApplication", {commandHandler: mainCommandHandler});

        try {
            await mainCommandHandler.onCommand(options.parsedArgs);
        }
        catch (err) {
            console.log("ERROR", `Failed to execute command: ${String(err)} [${err.info?.code}]`);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async stop(force = false) {
        // haha lol
        process.exit(0);
    }
}
