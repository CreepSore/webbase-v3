/* eslint-disable new-cap */
import sqlze from "sequelize";

export default class Setting extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            name: {
                primaryKey: true,
                type: sqlze.STRING(64),
                unique: true
            },
            value: {
                type: sqlze.TEXT
            }
        }, {
            sequelize,
            tableName: "setting",
            freezeTableName: true
        });
    }
}
