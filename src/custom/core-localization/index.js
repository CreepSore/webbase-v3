/* eslint-disable no-unused-vars */
import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";

import Localization from "./models/Localization.js";
import Version from "../../models/Version.js";
import Language from "./models/Language.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 */

export default class Core extends CustomerLogic {
    /** @param {import("../../service/customer-logic/types").StartCliApplicationParams} params */
    async onStartCliApplication(params) {
    }

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Language.initialize(params.sequelize);
        Localization.initialize(params.sequelize);

        Language.hasMany(Localization);
        Localization.belongsTo(Language);
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await Version.create({
            name: this.extensionInfo.name,
            version: this.extensionInfo.version
        });
    }

    /** @param {import("../../service/customer-logic/types").SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStart(params) {

    }

    /** @param {import("../../service/customer-logic/types").ExpressParams} params */
    async expressStop(params) {}

    getPriority() {return 1000;}
    async onLoad() {
        this.extensionInfo = await this.getMetadata();
    }
    async onUnload() {}
}
