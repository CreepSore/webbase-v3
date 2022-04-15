/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class QuantityUnit extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            name: {
                type: sqlze.STRING(12),
                allowNull: false,
                unique: true
            }
        }, {
            sequelize,
            tableName: "quantity_unit",
            freezeTableName: true
        });
    }
}
