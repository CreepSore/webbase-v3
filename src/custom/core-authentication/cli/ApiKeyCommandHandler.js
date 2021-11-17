import * as uuid from "uuid";

import CommandHandler from "../../../service/command-handler/CommandHandler.js";
import Exception from "../../core/Exception.js";
import ApiKeyService from "../service/ApiKeyService.js";

export default class ApiKeyCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("list", {
            help: "Lists all api keys",
            callback: async() => {
                let apiKeys = await ApiKeyService.getApiKeys();
                // @ts-ignore
                let apiKeyLines = apiKeys.map(apiKey => `  - ${apiKey.key} ; exp: <${apiKey.validUntil?.toISOString() || "infinity"}> ; permGroup: <${apiKey.PermissionGroup?.name || ""}> ; user: <${apiKey.User?.username || ""}>`).join("\n");

                console.log("INFO", `API Keys:\n${apiKeyLines}`);
            }
        });

        this.registerSubHandler("create", CommandHandler.createFromObject({
            commands: {
                user: {
                    help: "<username> [expiresInSec] ; Generates a new Api Key for a certain user",
                    callback: async(args) => {
                        let key = uuid.v4();
                        await ApiKeyService.createUserApiKey(key, args[0], parseInt(args[1], 10) * 1000);
                        console.log("INFO", `Generated new API Key [${key}]`);
                    }
                },
                permGroup: {
                    help: "<perm_group_name> [expiresInSec] ; Generates a new Api Key for a certain permission group",
                    callback: async(args) => {
                        let key = uuid.v4();
                        await ApiKeyService.createPermGroupApiKey(key, args[0], parseInt(args[1], 10) * 1000);
                        console.log("INFO", `Generated new API Key [${key}]`);
                    }
                }
            }
        }));

        this.registerCommand("rm", {
            help: "<api_key> ; Removes a api key",
            callback: async(args) => {
                let deleted = await ApiKeyService.deleteApiKey(args[0]);

                if(deleted === 0) {
                    throw new Exception("Invalid API Key", {code: "CORE.AUTHENTICATION.INVALID_API_KEY"});
                }

                console.log("INFO", `Removed API Key [${args[0]}]`);
            }
        });
    }
}
