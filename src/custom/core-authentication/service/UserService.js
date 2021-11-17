import crypto from "crypto";

import sequelize from "sequelize";
const {Op} = sequelize;

import User from "../models/User.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";
import Exception from "../../core/Exception.js";
import TfaService from "../../../service/TfaService.js";

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
        return Boolean(await User.findOne({
            where: {id: uid},
            include: {
                model: PermissionGroup,
                include: [{
                    model: Permission,
                    where: {
                        name: {
                            [Op.or]: [
                                "CORE.AUTHENTICATION.ALL",
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
    static async registerUser(username, password, email = null, tfaKey = null, skipPasswordChecks = true) {
        if((await this.userExistsByUsername(username))
        || (email !== null && await this.userExistsByEmail(email))) {
            throw new Exception("User already exists", {code: "CORE.AUTHENTICATION.USER_EXISTS"});
        }

        if(!skipPasswordChecks) {
            if(!password.match(/[a-zA-Z]/)) {
                throw new Exception("Password must contain at least one letter", {code: "CORE.AUTHENTICATION.PASSWORD_NO_LETTER"});
            }

            if(password.length < 12) {
                throw new Exception("Password must be at least 12 characters long", {code: "CORE.AUTHENTICATION.PASSWORD_INVALID_LENGTH"});
            }
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
