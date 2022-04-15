/* eslint-disable new-cap */
import sqlze from "sequelize";

export default class ContainerSegment extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            quantity: {
                type: sqlze.FLOAT,
                defaultValue: 0
            }
        }, {
            sequelize,
            tableName: "container_segment",
            freezeTableName: true
        });
    }
}
