/* eslint-disable no-unused-vars */
import CustomerLogic from "../../service/customer-logic/CustomerLogic.js";

import EorgService from "../eorg-core/service/EorgService.js";
import Container from "../eorg-core/models/Container.js";

/**
 * @typedef {import("../../service/customer-logic/types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("../../service/customer-logic/types").SequelizeParams} SequelizeParams
 * @typedef {import("../../service/customer-logic/types").ExpressParams} ExpressParams
 * @typedef {import("../../service/customer-logic/types").StartCliApplicationParams} StartCliApplicationParams
 */

export default class EorgTest extends CustomerLogic {
    /** @param {StartCliApplicationParams} params */
    async onStartCliApplication(params) {}

    async onStartInstallerApplication() {}

    async onStartMainApplication() {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupModels(params) {}

    /** @param {SequelizeParams} params */
    async sequelizeSetupRelation(params) {}

    /** @param {SequelizeParams} params */
    async sequelizeFirstInstall(params) {}


    /** @param {ExpressParams} params */
    async beforeExpressStart(params) { }

    /** @param {ExpressParams} params */
    async afterExpressStart(params) { }

    /** @param {ExpressParams} params */
    async expressStart(params) {
        await EorgService.deleteContainer({id: await EorgService.resolveContainerName("test-container")}).catch(() => {});
        await EorgService.deleteItem({id: await EorgService.resolveItemName("test-item1")}).catch(() => {});
        await EorgService.deleteItem({id: await EorgService.resolveItemName("test-item2")}).catch(() => {});

        let testItem1 = await (EorgService.createItem({name: "test-item1"}));
        let testItem2 = await (EorgService.createItem({name: "test-item2"}));
        let testContainer = await (EorgService.createContainer("test-container", [{
            itemId: testItem1,
            quantity: 10
        }, {
            itemId: testItem2,
            quantity: 20
        }, {
            itemId: testItem2,
            quantity: -20
        }]));

        await EorgService.deleteContainer({id: testContainer});
        await EorgService.deleteItem({id: testItem1});
        await EorgService.deleteItem({id: testItem2});
    }

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
