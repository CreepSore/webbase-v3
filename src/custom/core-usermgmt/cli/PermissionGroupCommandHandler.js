import CommandHandler from "../../../service/command-handler/CommandHandler.js";
import Exception from "../../core/Exception.js";

import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import PermissionService from "../service/PermissionService.js";

export default class PermissionGroupCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("list", {
            help: "Lists all PermissionGroups",
            callback: this.listPermissionGroups
        });

        this.registerCommand("listPerm", {
            help: "<group_name>; Lists all permissions of a group",
            callback: (args) => this.listGroupPermissions(args[0])
        });

        this.registerCommand("addPerm", {
            help: "<group_name> <perm_name>; Lists all permissions of a group",
            callback: (args) => this.addPermission(args[0], args[1])
        });

        this.registerCommand("rmPerm", {
            help: "<group_name> <perm_name>; Lists all permissions of a group",
            callback: (args) => this.removePermission(args[0], args[1])
        });

        this.registerCommand("addPermGroup", {
            help: "<group_name> <description>; Lists all permissions of a group",
            callback: (args) => this.addPermissionGroup(args[0], args[1])
        });

        this.registerCommand("rmPermGroup", {
            help: "<group_name>; Lists all permissions of a group",
            callback: (args) => this.removePermissionGroup(args[0], args[1])
        });
    }

    async addPermissionGroup(groupName, description) {
        await PermissionService.createPermissionGroup(groupName, description);
        console.log(`Successfully created PermissionGroup [${groupName}]`);
    }

    async removePermissionGroup(groupName, force) {
        await PermissionService.deletePermissionGroup(groupName, force === "true");
        console.log(`Successfully removed PermissionGroup [${groupName}]`);
    }

    async addPermission(groupName, permissionName) {
        await PermissionService.addPermissionToGroup(groupName, permissionName);
        console.log(`Successfully added Permission [${permissionName}] to [${groupName}]`);
    }

    async removePermission(groupName, permissionName) {
        await PermissionService.removePermissionFromGroup(groupName, permissionName);
        console.log(`Successfully removed Permission [${permissionName}] from [${groupName}]`);
    }

    async listGroupPermissions(groupName) {
        let group = await PermissionGroup.findOne({where: {name: groupName}, include: [Permission]});
        if(!group) throw new Exception("Invalid Permission Group", {code: "CORE.USERMGMT.INVALID_PERM_GROUP"});

        // @ts-ignore
        let permissions = group.Permissions.map(x => `  ${x.name}: ${x.description}`);
        // @ts-ignore
        console.log("INFO", `Permissions of group [${group.name}]: \n${permissions.join("\n")}`);
    }

    async listPermissionGroups() {
        // @ts-ignore
        let permGroups = (await PermissionGroup.findAll()).map(x => `  ${x.name}: ${x.description}`);
        console.log("INFO", `PermissionGroups: \n${permGroups.join("\n")}`);
    }
}
