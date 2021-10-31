import crypto from "crypto";

import sequelize from "sequelize";
const {Op} = sequelize;

import User from "../models/User.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import Exception from "../../core/Exception.js";
import TfaService from "../../../service/TfaService.js";

export default class UserService {
    static async hasPermission(uid, permission) {
        return Boolean(await User.findOne({
            where: {id: uid},
            include: {
                model: PermissionGroup,
                include: [{
                    model: Permission,
                    where: {
                        name: {
                            [Op.or]: [
                                "CORE.USERMGMT.ALL",
                                permission
                            ]
                        }
                    }
                }]
            }
        }));
    }

    static async setPermissionGroup(uid, permissionGroup) {
        let permGroup = await PermissionGroup.findOne({where: {name: permissionGroup}});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.USERMGMT.INVALID_PERM_GROUP"});

        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.USERMGMT.INVALID_USER"});

        // @ts-ignore
        await user.setPermissionGroup(permGroup);
    }

    static async getUserByUid(uid = "") {
        return await User.findByPk(uid);
    }

    static async getUserByUsername(name = "") {
        return await User.findOne({where: {username: name}});
    }

    static async getUserByEmail(email = "") {
        return await User.findOne({where: {email}});
    }

    static async userExistsByUid(uid) {
        return await this.getUserByUid(uid) !== null;
    }

    static async getUserByCredentials(username, password) {
        return await User.findOne({
            where: {
                username,
                password: this.hashPassword(password)
            }
        });
    }

    static async userExistsByUsername(name) {
        return await this.getUserByUsername(name) !== null;
    }

    static async userExistsByEmail(email) {
        return await this.getUserByEmail(email) !== null;
    }

    static async checkTfa(uid, tokenIn) {
        let user = await this.getUserByUid(uid);
        if(!user) return false;
        // @ts-ignore
        if(!user.tfaKey) return true;

        // @ts-ignore
        return TfaService.verify(user.tfaKey, tokenIn.replace(/ /g, ""));
    }

    /**
     * Registers a new user
     * @static
     * @param {string} username username
     * @param {string} password UNHASHED password
     * @param {string} [email=null] email
     * @param {string} [tfaKey=null] UNENCODED key
     * @return {Promise<User>}
     * @memberof UserService
     */
    static async registerUser(username, password, email = null, tfaKey = null) {
        if((await this.userExistsByUsername(username))
        || (email !== null && await this.userExistsByEmail(email))) {
            throw new Exception("User already exists", {code: "CORE.USERMGMT.USER_EXISTS"});
        }

        try {
            let options = {
                username,
                password: this.hashPassword(password),
                email,
                tfaKey
            };

            if(!email) delete options.email;
            if(!tfaKey) delete options.tfaKey;

            let createdUser = await User.create(options);

            // @ts-ignore
            return createdUser;
        }
        catch {
            throw new Exception("User creation failed", {code: "CORE.UNKNOWN"});
        }
    }

    static hashPassword(password) {
        return crypto
            .createHash("SHA256")
            .update(password)
            .digest()
            .toString("base64");
    }
}
