import { Sequelize } from "sequelize";

import CustomerLogicHandler from "../../service/customer-logic/CustomerLogicHandler.js";
import KvpStorage from "../../service/KvpStorage.js";

import Version from "../../models/Version.js";

export default class SequelizeLoader {
    constructor() {
        this.sequelize = this.instantiateSequelize();
        KvpStorage.instance.setItem(KvpStorage.defaultKeys.sequelize, this.sequelize);
    }

    instantiateSequelize() {
        let cfg = KvpStorage.instance.wrapper.getConfig();
        /** @type {import("sequelize").Sequelize} */
        let sequelize;

        if(cfg.db.type.toLowerCase() === "sqlite") {
            sequelize = new Sequelize({
                dialect: "sqlite",
                storage: cfg.db.sqlite.file,
                logging: cfg.db.logging
            });
        }
        else if(["mariadb", "mysql"].includes(cfg.db.type.toLowerCase())) {
            sequelize = new Sequelize(
                cfg.db.mariadb.database,
                cfg.db.mariadb.user,
                cfg.db.mariadb.password,
                {
                    // @ts-ignore
                    dialect: cfg.db.type, // Not setting staticly like sqlite because of mariadb and mysql being seperate dialects
                    logging: cfg.db.logging
                });
        }
        else {
            throw new Error(`Invalid dialect [${cfg.db.type}] selected!`);
        }

        return sequelize;
    }

    async start() {
        await this.setupModels();
        await this.setupRelations();
    }

    async stop() {
        await this.sequelize.close();
    }

    async setupModels() {
        Version.initialize(this.sequelize);

        await CustomerLogicHandler.instance.runAllCustomerLogicFunction("sequelizeSetupModels", {sequelize: this.sequelize});
    }

    async setupRelations() {
        await CustomerLogicHandler.instance.runAllCustomerLogicFunction("sequelizeSetupRelation", {sequelize: this.sequelize});
    }

    /**
     * @param {import("sequelize").SyncOptions} syncOptions
     */
    async doSync(syncOptions) {
        await this.sequelize.sync(syncOptions);
    }

    async checkDb() {
        let errors = [];

        await Promise.all(
            Object.entries(this.sequelize.models).map(async model => {
                try {
                    await model[1].findAll();
                }
                catch (err) {
                    errors.push({model: model[0], error: err});
                }
            })
        );

        return errors;
    }
}
