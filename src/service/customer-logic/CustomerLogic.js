/* eslint-disable no-unused-vars */
import KvpStorage from "../KvpStorage.js";

/**
 * @typedef {import("./types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class CustomerLogic {
    /** @type {CustomerLogicDependencies} */
    dependencies;
    loading = false;
    loaded = false;

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
    async beforeExpressStart(params) {}
    /** @param {import("./types").ExpressParams} params */
    async afterExpressStart(params) {}
    /** @param {import("./types").ExpressParams} params */
    async expressStart(params) {}
    /** @param {import("./types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 0;}
    getPluginDir() {return this.dependencies.additionalDependencies.pluginDir;}
    getMetadata() {return this.dependencies.additionalDependencies.metadata;}
    getWebpackConfig(params) { return {}; }
    getConfigModel() { return {}; }
    getConfig(key = null) {
        let cfg = KvpStorage.instance.wrapper.getConfig();
        let cfgBase = cfg.extensions?.[this.getMetadata().name];
        return key === null ? cfgBase : cfgBase[key];
    }
    async onLoad() {}
    async onUnload() {}
    async injectDependencies(dependencies) {
        this.dependencies = dependencies;
    }
}
