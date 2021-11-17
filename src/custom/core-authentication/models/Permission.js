/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class Permission extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            name: {
                type: sqlze.STRING(255),
                allowNull: false,
                unique: true
            },
            description: {
                type: sqlze.TEXT({length: "long"}),
                allowNull: true,
                defaultValue: ""
            }
        }, {
            sequelize,
            tableName: "permissions",
            freezeTableName: true
        });
    }
}
