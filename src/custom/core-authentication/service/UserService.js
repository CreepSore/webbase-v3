import crypto from "crypto";

import sequelize from "sequelize";
const {Op} = sequelize;

import User from "../models/User.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import PermissionService from "./PermissionService.js";
import Exception from "../../core/Exception.js";
import TfaService from "../../../service/TfaService.js";
import { base32 } from "rfc4648";

import permissions from "../permissions.js";

export default class UserService {
    /**
     * Checks if the user has the specified permission
     * or the 'ALL'-permission
     * @static
     * @param {string} uid
     * @param {string} permission
     * @return {Promise<boolean>}
     * @memberof UserService
     */
    static async hasPermission(uid, permission) {
        if(!uid) {
            return await PermissionService.isAnonymousPermission(permission);
        }

        let result = await User.findOne({
            where: {id: uid},
            include: {
                model: PermissionGroup,
                include: [{
                    model: Permission,
                    where: {
                        name: {
                            [Op.or]: [
                                permissions.core_all.key,
                                permission
                            ]
                        }
                    },
                    required: true
                }],
                required: true
            }
        });
        return Boolean(result);
    }

    /**
     * Sets the PermissionGroup of a certain user
     * @static
     * @param {string} uid
     * @param {string} permissionGroup
     * @memberof UserService
     */
    static async setPermissionGroup(uid, permissionGroup) {
        let permGroup = await PermissionGroup.findOne({where: {name: permissionGroup}});
        if(!permGroup) throw new Exception("Invalid Permission Group", {code: "CORE.AUTHENTICATION.INVALID_PERM_GROUP"});

        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.AUTHENTICATION.INVALID_USER"});

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

    static async getUsers() {
        return await User.findAll({
            include: [
                {
                    model: PermissionGroup,
                    include: [{
                        model: Permission
                    }]
                }
            ]
        });
    }

    static async userExistsByUid(uid) {
        return await this.getUserByUid(uid) !== null;
    }

    static async getUserByCredentials(username, password) {
        return await User.findOne({
            where: {
                [Op.or]: {
                    username,
                    email: username
                },
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

    static async deleteUser(uid) {
        return await User.destroy({where: {id: uid}});
    }

    /**
     * Checks if the token is correct.
     * Returns true if the user does not have TFA enabled.
     * @static
     * @param {string} uid
     * @param {string} tokenIn
     * @return {Promise<boolean>}
     * @memberof UserService
     */
    static async checkTfa(uid, tokenIn) {
        let user = await this.getUserByUid(uid);
        if(!user) return false;
        // @ts-ignore
        if(!user.tfaKey) return true;
        if(!tokenIn) return false;

        // @ts-ignore
        return TfaService.verify(user.tfaKey, tokenIn.replace(/ /g, ""));
    }

    /**
     * Checks user credentials and returns the
     * sequelize user object if login was successful
     * @static
     * @param {string} username
     * @param {string} password
     * @param {string} [tfaToken=null]
     * @return {Promise<User>}
     * @memberof UserService
     */
    static async loginUser(username, password, tfaToken = null) {
        let user = await this.getUserByCredentials(username, password);
        if(!user) throw new Exception("Invalid Credentials", {code: "CORE.AUTHENTICATION.INVALID_CREDENTIALS"});
        // @ts-ignore
        if(!user.active) throw new Exception("User is disabled", {code: "CORE.AUTHENTICATION.USER_DISABLED"});

        // @ts-ignore
        let tfaCheckResult = await this.checkTfa(user.id, tfaToken);
        if(!tfaCheckResult) {
            if(tfaToken) {
                throw new Exception("Invalid TFA Token", {code: "CORE.AUTHENTICATION.INVALID_TFA_TOKEN"});
            }
            else {
                throw new Exception("No TFA Token provided", {code: "CORE.AUTHENTICATION.NO_TFA_TOKEN"});
            }
        }

        return user;
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
    static async registerUser(username, password, email = null, tfaKey = null, skipChecks = true) {
        if((await this.userExistsByUsername(username))
        || (email !== null && await this.userExistsByEmail(email))) {
            throw new Exception("User already exists", {code: "CORE.AUTHENTICATION.USER_EXISTS"});
        }

        if(!skipChecks) {
            let passwordError = this.checkPassword(password);
            if(passwordError) throw passwordError;

            let emailError = this.checkEmail(email);
            if(emailError) throw emailError;
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

    static async updateUserInformationBasic(uid, email, password, skipChecks = true) {
        let updatePayload = {};

        if(email) {
            if(!skipChecks) {
                let emailError = this.checkEmail(email);
                if(emailError) {
                    throw emailError;
                }
            }
            updatePayload.email = email;
        }

        if(password) {
            if(!skipChecks) {
                let passwordError = this.checkPassword(password);
                if(passwordError) {
                    throw passwordError;
                }
            }
            updatePayload.password = this.hashPassword(password);
        }

        await User.update(updatePayload, {where: {id: uid}});
    }

    static async updateUserInformationAdvanced(uid, username, tfaKey, active, permissionGroupName) {
        let updatePayload = {
            username,
            active
        };

        if(tfaKey) {
            let toEncode = Buffer.from(tfaKey);
            // eslint-disable-next-line no-param-reassign
            updatePayload.tfaKey = base32.stringify(toEncode, {pad: true});
        }

        if(permissionGroupName) {
            let permissionGroup = await PermissionGroup.findOne({where: {name: permissionGroupName}});
            if(permissionGroup) {
                // @ts-ignore
                updatePayload.PermissionGroupId = permissionGroup.id;
            }
        }

        await User.update(updatePayload, {where: {id: uid}});
    }

    static checkEmail(email) {
        let mailRegex = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        if(!mailRegex.test(email)) {
            return new Exception("Invalid Email", {code: "CORE.AUTHENTICATION.INVALID_EMAIL"});
        }

        return null;
    }

    static checkPassword(password) {
        if(!/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(password)) {
            return new Exception("Password must contain one letter and one number", {code: "CORE.AUTHENTICATION.PASSWORD_SYMBOL_MISMATCH"});
        }

        // Not checking length via regex for better error handling
        if(password.length < 12) {
            return new Exception("Password must be at least 12 characters long", {code: "CORE.AUTHENTICATION.PASSWORD_INVALID_LENGTH"});
        }

        return null;
    }

    static hashPassword(password) {
        return crypto
            .createHash("SHA256")
            .update(password)
            .digest()
            .toString("base64");
    }
}
