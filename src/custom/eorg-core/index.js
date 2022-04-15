/* eslint-disable no-unused-vars */
import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";
import Version from "../../models/Version.js";

import Container from "./models/Container.js";
import Item from "./models/Item.js";
import QuantityUnit from "./models/QuantityUnit.js";
import ContainerSegment from "./models/ContainerSegment.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class EorgCore extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
    async onStartCliApplication(params) {}

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {
        Container.initialize(params.sequelize);
        Item.initialize(params.sequelize);
        QuantityUnit.initialize(params.sequelize);
        ContainerSegment.initialize(params.sequelize);
    }

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {
        Container.belongsToMany(Item, {through: ContainerSegment});
        Item.belongsToMany(Container, {through: ContainerSegment});

        Item.belongsTo(QuantityUnit);
        QuantityUnit.hasMany(Item);
    }

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {
        await Version.findOrCreate({
            where: {
                name: this.getMetadata().name,
                version: this.getMetadata().version
            }
        });
    }


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
