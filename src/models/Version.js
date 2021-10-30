/* eslint-disable new-cap */
import sqlz from "sequelize";
import * as uuid from "uuid";

export default class Version extends sqlz.Model {
    /** @param {sqlz.Sequelize} sequelize */
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlz.STRING(36),
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuid.v4()
            },
            name: {
                type: sqlz.STRING(255),
                allowNull: false,
                unique: true
            },
            version: {
                type: sqlz.STRING(20),
                allowNull: false
            }
        }, {
            sequelize
        });
    }
}
