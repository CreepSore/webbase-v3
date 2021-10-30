import CommandHandler from "../../../service/command-handler/CommandHandler.js";
import Exception from "../../core/Exception.js";

import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";

export default class PermissionGroupCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("list", {
            help: "Lists all PermissionGroups",
            callback: this.listPermissionGroups
        });

        this.registerCommand("listperm", {
            help: "<group_name>; Lists all permissions of a group",
            callback: (args) => this.listGroupPermissions(args[0])
        });
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
