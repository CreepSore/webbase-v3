/* eslint-disable no-unused-vars */

/**
 * @typedef {import("./types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class CustomerLogic {
    /** @type {CustomerLogicDependencies} */
    #dependencies;

    /** @param {import("./types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {}
    async onStartInstallerApplication() {}
    async onStartMainApplication() {}

    /** @param {import("./types").SequelizeParams} params */
    async sequelizeSetupModels(params) {}
    /** @param {import("./types").SequelizeParams} params */
    async sequelizeFirstInstall(params) {}
    /** @param {import("./types").SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {import("./types").ExpressParams} params */
    async expressStart(params) {}
    /** @param {import("./types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 0;}
    async onLoad() {}
    async onUnload() {}
    async injectDependencies(dependencies) {
        this.#dependencies = dependencies;
    }
}
