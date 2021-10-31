import Exception from "../../core/Exception.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import User from "../models/User.js";

export default class PermissionService {
    static async createPermission(permName, description) {
        let existing = await Permission.findOne({where: {name: permName}});
        if(existing) throw new Exception("Permission already exists", {code: "CORE.USERMGMT.PERM_EXISTS"});

        await Permission.create({
            name: permName,
            description
        });
    }

    static async deletePermission(permName) {
        let existing = await Permission.findOne({where: {name: permName}});
        if(!existing) throw new Exception("Permission does not exist", {code: "CORE.USERMGMT.INVALID_PERM"});

        let associatedGroups = await PermissionGroup.findAll({
            include: [{
                model: Permission,
                through: {
                    where: {
                        // @ts-ignore
                        PermissionId: existing.id
                    }
                }
            }]
        });

        // @ts-ignore
        await Promise.all(associatedGroups.map(group => group.removePermission(existing)));

        await existing.destroy();
    }

    static async createPermissionGroup(groupName, description) {
        let existing = await PermissionGroup.findOne({where: {name: groupName}});
        if(existing) throw new Exception("Permission Group already exists", {code: "CORE.USERMGMT.PERM_GROUP_EXISTS"});

        return await PermissionGroup.create({
            name: groupName,
            description
        });
    }

    static async deletePermissionGroup(groupName, force = false) {
        let permGroup = await PermissionGroup.findOne({where: {name: groupName}, include: [User, Permission]});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.USERMGMT.INVALID_PERM_GROUP"});

        // @ts-ignore
        if(permGroup.Users.length > 0 && !force) throw new Exception("Existing users found in PermissionGroup", {code: "CORE.USERMGMT.PERM_GROUP.EXISTING_USERS"});
        let defaultGroup = await this.getDefaultPermissionGroup();

        // @ts-ignore
        await Promise.all(permGroup.Users.map(user => user.setPermissionGroup(defaultGroup)));
        // @ts-ignore
        await Promise.all(permGroup.Permissions.map(perm => permGroup.removePermission(perm)));

        await permGroup.destroy();
    }

    static async addPermissionToGroup(groupName, permissionName) {
        let permGroup = await PermissionGroup.findOne({where: {name: groupName}});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.USERMGMT.INVALID_PERM_GROUP"});
        let perm = await Permission.findOne({where: {name: permissionName}});
        if(!perm) throw new Exception("Invalid Permission", {code: "CORE.USERMGMT.INVALID_PERM"});

        // @ts-ignore
        return await permGroup.addPermission(perm);
    }

    static async removePermissionFromGroup(groupName, permissionName) {
        let permGroup = await PermissionGroup.findOne({where: {name: groupName}});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.USERMGMT.INVALID_PERM_GROUP"});
        let perm = await Permission.findOne({where: {name: permissionName}});
        if(!perm) throw new Exception("Invalid Permission", {code: "CORE.USERMGMT.INVALID_PERM"});

        // @ts-ignore
        await permGroup.removePermission(perm);
    }

    static async isAnonymousPermission(permName) {
        let permission = await Permission.findOne({where: {name: permName}});
        if(!permission) return false;

        // @ts-ignore
        return (await this.getAnonymousPermissionGroup()).hasPermission(permission);
    }

    static async getDefaultPermissionGroup() {
        return PermissionGroup.findOne({where: {name: "Default"}});
    }

    static async getSuperAdminPermissionGroup() {
        return PermissionGroup.findOne({where: {name: "SuperAdmin"}});
    }

    static async getAnonymousPermissionGroup() {
        return PermissionGroup.findOne({where: {name: "Anonymous"}});
    }
}
