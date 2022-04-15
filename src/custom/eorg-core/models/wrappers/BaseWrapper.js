import EorgExceptions from "../../exceptions.js";

export default class BaseWrapper {
    constructor(sequelizeObject) {
        if(!sequelizeObject) {
            throw EorgExceptions.construct(EorgExceptions.invalidSequelizeObject, "Invalid sequelize object");
        }

        /** @type {import("sequelize").Model} */
        this.sequelizeObject = sequelizeObject;
    }

    save() {
        return this.sequelizeObject.save();
    }

    reload() {
        return this.sequelizeObject.reload();
    }
}
