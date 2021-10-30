/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class User extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.UUID,
                defaultValue: () => uuid.v4(),
                primaryKey: true
            },
            username: {
                type: sqlze.STRING(64),
                unique: true,
                allowNull: false
            },
            email: {
                type: sqlze.STRING(255),
                unique: true,
                allowNull: true
            },
            password: {
                type: sqlze.STRING(255),
                allowNull: false
            },
            active: {
                type: sqlze.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            tfaKey: {
                type: sqlze.STRING(255),
                allowNull: true,
                defaultValue: null,
                unique: true
            }
        }, {
            sequelize,
            tableName: "users",
            freezeTableName: true
        });
    }
}
