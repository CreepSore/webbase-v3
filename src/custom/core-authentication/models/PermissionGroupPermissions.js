/* eslint-disable new-cap */
import * as uuid from "uuid";
import sqlze from "sequelize";

export default class PermissionGroupPermissions extends sqlze.Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: sqlze.STRING(36),
                primaryKey: true,
                defaultValue: () => uuid.v4()
            }
        }, {
            sequelize,
            tableName: "permission_group_permissions",
            freezeTableName: true
        });
    }
}
