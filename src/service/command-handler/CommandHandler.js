/**
 * @typedef {Object} Command
 * @property {Function} callback
 * @property {string} help
 */

/**
 * @typedef {Object} CommandHandlerObjectCreator
 * @property {Object<string, CommandHandlerObjectCreator>=} subHandlers
 * @property {Object<string, Command>=} commands
 */

export default class CommandHandler {
    constructor() {
        /** @type {Map<string, CommandHandler>} */
        this.subHandler = new Map();

        /** @type {Map<string, Command>} */
        this.commands = new Map();
    }

    getHelpText(cmdPrefix = "") {
        return [...this.commands]
            .map(x => `${cmdPrefix} ${x[0]}: ${x[1].help}`)
            .concat(
                [...this.subHandler]
                    .map(x => x[1].getHelpText(`${cmdPrefix}${cmdPrefix ? " " : ""}${x[0]}`))
            ).join("\n");
    }

    /**
     * @param {string} trigger
     * @param {Command} callback
     */
    registerCommand(trigger, callback) {
        this.commands.set(trigger, callback);
    }

    /**
     * @param {string} trigger
     * @param {CommandHandler} commandHandler
     * @returns
     */
    registerSubHandler(trigger, commandHandler) {
        if(!trigger || !commandHandler) return;
        this.subHandler.set(trigger, commandHandler);
    }

    /** @param {import("minimist").ParsedArgs} args */
    async onCommand(args) {
        let arg0 = args._[0];
        if(this.commands.has(arg0)) {
            await this.commands.get(arg0)?.callback?.(args._.slice(1));
            return;
        }

        let commandHandler = this.subHandler.get(arg0);

        if(!commandHandler) {
            console.log("ERROR", "Invalid command.");
            return;
        }

        // @ts-ignore
        await commandHandler?.onCommand({_: args._.slice(1)});
    }

    /**
     * @param {CommandHandlerObjectCreator} obj
     */
    static createFromObject(obj) {
        let cmdHandler = new this();
        Object.entries(obj.subHandlers || {}).forEach(handlerobj => {
            let subhandler = this.createFromObject(handlerobj[1]);
            cmdHandler.registerSubHandler(handlerobj[0], subhandler);
        });

        Object.entries(obj.commands || {}).forEach(command => {
            cmdHandler.registerCommand(command[0], command[1]);
        });

        return cmdHandler;
    }
}
