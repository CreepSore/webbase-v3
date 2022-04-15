// @ts-nocheck
import BaseWrapper from "./BaseWrapper.js";

import EorgService from "../../service/EorgService.js";

export default class ContainerWrapper extends BaseWrapper {
    constructor(container) {
        super(container);
    }

    /** @type {string} */
    get id() { return this.sequelizeObject.id; }
    set id(val) { this.sequelizeObject.id = val; }

    /** @type {string} */
    get name() { return this.sequelizeObject.name; }
    set name(val) { this.sequelizeObject.name = val; }

    static getByCode(code) {
        return EorgService.getContainerByCode(code);
    }

    toString() {
        return JSON.stringify(this);
    }
}
