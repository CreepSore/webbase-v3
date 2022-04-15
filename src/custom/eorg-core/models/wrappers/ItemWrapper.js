// @ts-nocheck
import BaseWrapper from "./BaseWrapper.js";

import EorgService from "../../service/EorgService.js";

export default class ItemWrapper extends BaseWrapper {
    constructor(item) {
        super(item);
    }

    /** @type {string} */
    get id() { return this.sequelizeObject.id; }
    set id(val) { this.sequelizeObject.id = val; }

    /** @type {string} */
    get name() { return this.sequelizeObject.name; }
    set name(val) { this.sequelizeObject.name = val; }

    /** @type {string} */
    get description() { return this.sequelizeObject.description; }
    set description(val) { this.sequelizeObject.description = val; }

    static getByCode(code) {
        return EorgService.getItemByCode(code);
    }
}
