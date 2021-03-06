/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class Localization extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            key: {
                type: sqlze.STRING(256),
                allowNull: false
            },
            value: {
                type: sqlze.TEXT,
                unique: false,
                allowNull: false,
                defaultValue: () => ""
            }
        }, {
            sequelize,
            tableName: "localization",
            freezeTableName: true,
            indexes: [
                {
                    fields: ["LanguageId", "key"],
                    unique: true
                }
            ]
        });
    }
}
