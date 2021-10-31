import CommandHandler from "../../../service/command-handler/CommandHandler.js";

import Permission from "../models/Permission.js";
import PermissionService from "../service/PermissionService.js";

export default class PermissionCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("list", {
            help: "Lists all Permissions",
            callback: this.listPermissions
        });

        this.registerCommand("add", {
            help: "<perm_name> <description> ; Adds a new permission",
            callback: (args) => this.addPermission(args[0], args[1])
        });

        this.registerCommand("rm", {
            help: "<perm_name> ; Deletes a existing permission",
            callback: (args) => this.removePermission(args[0])
        });
    }

    async addPermission(name, description) {
        await PermissionService.createPermission(name, description);
        console.log(`Successfully created permission ${name}`);
    }

    async removePermission(name) {
        await PermissionService.deletePermission(name);
        console.log(`Successfully removed permission ${name}`);
    }

    async listPermissions() {
        // @ts-ignore
        let permissions = (await Permission.findAll()).map(x => `  ${x.name}: ${x.description}`);
        console.log("INFO", `Permissions: \n${permissions.join("\n")}`);
    }
}
