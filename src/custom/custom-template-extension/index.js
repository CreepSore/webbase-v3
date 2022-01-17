/* eslint-disable no-unused-vars */
import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Version from "../../models/Version.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class ExtensionTemplate extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
    async onStartCliApplication(params) {}

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {}

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await Version.create({
            name: this.getMetadata().name,
            version: this.getMetadata().version
        });
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {ExpressParams} params */
    async beforeExpressStart(params) { }

    /** @param {ExpressParams} params */
    async afterExpressStart(params) { }

    /** @param {ExpressParams} params */
    async expressStart(params) { }

    /** @param {ExpressParams} params */
    async expressStop(params) {}

    getWebpackConfig(params) {
        return {};
    }

    getConfigModel() {
        return {};
    }

    exposeApi() {
        return {};
    }

    getPriority() {return 1000;}
    async onLoad() { }
    async onUnload() {}
}
