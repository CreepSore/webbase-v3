/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class ApiKey extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            },
            key: {
                type: sqlze.TEXT,
                unique: true
            },
            validUntil: {
                type: sqlze.DATE,
                allowNull: true
            },
            expired: {
                type: sqlze.VIRTUAL,
                get() {
                    return this.get("validUntil") && Date.now() > this.get("validUntil");
                }
            }
        }, {
            sequelize,
            tableName: "apikey",
            freezeTableName: true
        });
    }
}
