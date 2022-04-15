/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class Container extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            name: {
                type: sqlze.STRING(255),
                unique: true,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: "container",
            freezeTableName: true
        });
    }
}
