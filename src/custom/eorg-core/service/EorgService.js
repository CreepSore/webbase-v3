import exceptions from "../exceptions.js";
import EorgException from "../exceptions.js";

import Container from "../models/Container.js";
import Item from "../models/Item.js";
import ContainerSegment from "../models/ContainerSegment.js";

import ContainerWrapper from "../models/wrappers/ContainerWrapper.js";
import ItemWrapper from "../models/wrappers/ItemWrapper.js";

export default class EorgService {
    static decodeCode(code) {
        const splittedCode = code.split(".");
        const decodedCode = splittedCode.map(i => Buffer.from(i, "base64").toString("utf-8"));
        const codeType = decodedCode[0];
        const resolveType = decodedCode[1];
        const codeValue = decodedCode[2];

        return {
            type: codeType,
            resolveType,
            value: codeValue
        };
    }

    static createCode(type, resolveType = "0", value = "0") {
        let codeItems = [type, resolveType, value].map(i => Buffer.from(i).toString("base64"));
        return codeItems.join(".");
    }

    /**
     * @static
     * @param {Container | ContainerWrapper} container
     * @param {string} [type="id"|"name"]
     * @return {string}
     * @memberof EorgService
     */
    static createCodeFromContainer(container, type = "id") {
        return this.createCode("container", type, container[type]);
    }

    /**
     * @static
     * @param {Item | ItemWrapper} item
     * @param {string} [type="id"]
     * @return {string}
     * @memberof EorgService
     */
    static createCodeFromItem(item, type = "id") {
        return this.createCode("item", type, item[type]);
    }

    static async getContainerByCode(code) {
        let decoded = this.decodeCode(code);
        if(decoded.type !== "container") {
            throw EorgException.construct(EorgException.invalidCodeType, "Invalid container code");
        }

        switch(decoded.resolveType) {
            case "id":
                return new ContainerWrapper(Container.findByPk(decoded.value));

            case "name":
                return new ContainerWrapper(Container.findOne({where: {name: decoded.value}}));

            default:
                throw EorgException.construct(EorgException.invalidCodeResolveType, "Invalid container code");
        }
    }

    static async getItemByCode(code) {
        let decoded = this.decodeCode(code);
        if(decoded.type !== "item") {
            throw EorgException.construct(EorgException.invalidCodeType, "Invalid item code");
        }

        switch(decoded.resolveType) {
            case "id":
                return new ItemWrapper(Item.findByPk(decoded.value));

            default:
                throw EorgException.construct(EorgException.invalidCodeResolveType, "Invalid item code");
        }
    }

    /**
     * @static
     * @param {string} containerName
     * @return {Promise<string>} container id
     * @memberof EorgService
     */
    static async resolveContainerName(containerName) {
        // @ts-ignore
        return (await Container.findOne({where: {name: containerName}}))?.id;
    }

    /**
     * @static
     * @param {string} itemName
     * @return {Promise<string>} item id
     * @memberof EorgService
     */
    static async resolveItemName(itemName) {
        // @ts-ignore
        return (await Item.findOne({where: {name: itemName}}))?.id;
    }

    /**
     * @static
     * @param {{id?: string, name?: string}} options
     * @memberof EorgService
     */
    static async deleteContainer(options) {
        if(!options.id && !options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You have to specify at least id or name in the options parameter");
        }
        else if(options.id && options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You can't specify both id and name in the options parameter");
        }

        let id = options.name ? (await this.resolveContainerName(options.name)) : options.id;
        let container = await Container.findByPk(id);
        if(!container) throw exceptions.construct(exceptions.invalidContainer, "Invalid container");
        // @ts-ignore
        await container.destroy();
    }

    /**
     * @static
     * @returns {Promise<string>} container id
     * @param {string} containerName
     * @param {Array<AddItemToContainerOptions>} [items=[]]
     * @memberof EorgService
     */
    static async createContainer(containerName, items = []) {
        return await Container.create({name: containerName}).then(async container => {
            for(let itemData of items) {
                // @ts-ignore
                await this.addItemToContainer(container.id, {itemId: itemData.itemId, itemName: itemData.itemName, quantity: itemData.quantity});
            }

            // @ts-ignore
            return container.id;
        });
    }

    /**
     * @static
     * @param {{id?: string, name?: string}} options
     * @memberof EorgService
     */
    static async deleteItemFromAllContainers(options) {
        if(!options.id && !options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You have to specify at least id or name in the options parameter");
        }
        else if(options.id && options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You can't specify both id and name in the options parameter");
        }
        let id = options.name ? (await this.resolveItemName(options.name)) : options.id;

        if(!id) {
            throw exceptions.construct(exceptions.invalidItem, "Item does not exist");
        }

        ContainerSegment.destroy({where: {itemId: id}});
    }

    /**
     * @static
     * @returns {Promise<string>} item id
     * @param {{name: string, description?: string}} options
     * @memberof EorgService
     */
    static async createItem(options) {
        // @ts-ignore
        return await Item.create(options).then(item => item.id);
    }

    /**
     * @static
     * @param {{id?: string, name?: string}} options
     * @memberof EorgService
     */
    static async deleteItem(options) {
        if(!options.id && !options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You have to specify at least id or name in the options parameter");
        }
        else if(options.id && options.name) {
            throw exceptions.construct(exceptions.invalidArguments, "You can't specify both id and name in the options parameter");
        }

        let id = options.name ? (await this.resolveItemName(options.name)) : options.id;
        let isUsed = Boolean(await Container.findOne({include: [{model: Item, where: {id}}]}));

        if(isUsed) {
            throw exceptions.construct(exceptions.invalidAction, "Item is used in a container");
        }

        let item = await Item.findByPk(id);
        if(!item) throw exceptions.construct(exceptions.invalidItem, "Invalid item");
        // @ts-ignore
        await item.destroy();
    }

    static async getAllContainers() {
        return await Container.findAll();
    }

    static async getAllItems() {
        return await Item.findAll();
    }

    /**
     * @typedef {Object} AddItemToContainerOptions
     * @property {string} [itemName] You have to specify either itemName or itemId
     * @property {string} [itemId] You have to specify either itemName or itemId
     * @property {number} quantity
     */

    /**
     * Adds an item to a container.
     * Can also be used to remove an item from the container by specifying negative quantities.
     *
     * TODO: Maybe change to a more fitting name?
     *
     * @static
     * @param {string} containerId
     * @param {AddItemToContainerOptions} [options]
     * @memberof EorgService
     */
    static async addItemToContainer(containerId, options) {
        if(!options.itemId && !options.itemName) {
            throw exceptions.construct(exceptions.invalidArguments, "You have to specify at least itemId or itemName in the options parameter");
        }
        else if(options.itemId && options.itemName) {
            throw exceptions.construct(exceptions.invalidArguments, "You can't specify both itemId and itemName in the options parameter");
        }

        let itemId = options.itemId || (await this.resolveItemName(options.itemName));
        let quantity = options.quantity || 0;

        let container = await Container.findByPk(containerId, {include: [{model: Item, where: {id: itemId}, required: false}]});
        // @ts-ignore
        let item = container.Items[0];

        if(!item) {
            item = (await Item.findByPk(itemId));
            // @ts-ignore
            await container.addItem(item, {through: {quantity}});
            return;
        }

        if(item.ContainerSegment.quantity + quantity <= 0) {
            // @ts-ignore
            await container.removeItem(item);
            return;
        }

        item.ContainerSegment.quantity += quantity;
        await item.ContainerSegment.save();
    }
}
