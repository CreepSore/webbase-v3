/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class Language extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            name: {
                type: sqlze.STRING(255),
                unique: true
            },
            localeIdentifier: {
                type: sqlze.STRING(3),
                unique: true
            }
        }, {
            sequelize,
            tableName: "language",
            freezeTableName: true
        });
    }
}
