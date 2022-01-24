import sequelize from "sequelize";
const {Op} = sequelize;

import Exception from "../../core/Exception.js";
import ApiKey from "../models/ApiKey.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import User from "../models/User.js";

import PermissionService from "./PermissionService.js";
import UserService from "./UserService.js";

import authPerms from "../../core-authentication/permissions.js";

export default class ApiKeyService {
    static async createUserApiKey(apiKey, username, expiresIn = null) {
        const user = await UserService.getUserByUsername(username);
        if(!user) throw new Exception("Invalid User", {code: "CORE.AUTHENTICATION.INVALID_USER"});

        let apiKeyObject = await ApiKey.create({
            key: apiKey,
            validUntil: expiresIn ? Date.now() + expiresIn : undefined
        });

        // @ts-ignore
        await apiKeyObject.setUser(user);
        await apiKeyObject.save();
    }

    static async createPermGroupApiKey(apiKey, permGroupName, expiresIn = null) {
        const permGroup = await PermissionService.getPermissionGroupByName(permGroupName);
        if(!permGroup) throw new Exception("Invalid User", {code: "CORE.AUTHENTICATION.INVALID_USER"});

        let apiKeyObject = await ApiKey.create({
            key: apiKey,
            validUntil: expiresIn ? Date.now() + expiresIn : undefined
        });

        // @ts-ignore
        await apiKeyObject.setPermissionGroup(permGroup);
        await apiKeyObject.save();
    }

    static deleteApiKey(apiKey) {
        return ApiKey.destroy({where: {key: apiKey}});
    }

    static async getApiKeys() {
        return ApiKey.findAll({
            include: [{
                model: User
            }, {
                model: PermissionGroup
            }]
        });
    }

    static async getApiKey(apiKey) {
        let apiKeyObject = await ApiKey.findOne({where: {key: apiKey}});

        if(!apiKeyObject) throw new Exception("Invalid Api Key", {code: "CORE.AUTHENTICATION.INVALID_API_KEY"});

        return apiKeyObject;
    }

    /**
     * Checks if the api key has the specified permission
     * or the 'ALL'-permission
     * @static
     * @param {string} apiKey
     * @param {string} permission
     * @return {Promise<boolean>}
     * @memberof ApiKeyService
     */
    static async hasPermission(apiKey, permission) {
        return Boolean(await ApiKey.findOne({
            where: {key: apiKey},
            include: {
                model: PermissionGroup,
                include: [{
                    model: Permission,
                    where: {
                        name: {
                            [Op.or]: [
                                authPerms.core_all.key,
                                permission
                            ]
                        }
                    }
                }]
            }
        }));
    }

    static async setPermissionGroup(apiKey, permissionGroup) {
        let permGroup = await PermissionGroup.findOne({where: {name: permissionGroup}});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.AUTHENTICATION.INVALID_PERM_GROUP"});

        let apiKeyObject = await this.getApiKey(apiKey);
        if(!apiKeyObject) throw new Exception("Invalid Api Key", {code: "CORE.AUTHENTICATION.INVALID_API_KEY"});

        // @ts-ignore
        await apiKeyObject.setPermissionGroup(permGroup);
    }

    static async isValidApiKey(apiKey) {
        let apiKeyObject = await this.getApiKey(apiKey);

        if(!apiKeyObject) return false;
        // @ts-ignore
        if(apiKeyObject.expired) return false;

        return true;
    }
}
