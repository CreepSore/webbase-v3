import CommandHandler from "../../../service/command-handler/CommandHandler.js";

import Permission from "../models/Permission.js";
// @ts-ignore
import PermissionGroup from "../models/PermissionGroup.js";

export default class PermissionCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("list", {
            help: "Lists all Permissions",
            callback: this.listPermissions
        });
    }

    async listPermissions() {
        // @ts-ignore
        let permissions = (await Permission.findAll()).map(x => `  ${x.name}: ${x.description}`);
        console.log("INFO", `Permissions: \n${permissions.join("\n")}`);
    }
}
