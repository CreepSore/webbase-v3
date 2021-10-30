import fs from "fs";

import qrcode from "qrcode";
import base32 from "base32.js";
import * as uuid from "uuid";

import CommandHandler from "../../../service/command-handler/CommandHandler.js";
import Exception from "../../core/Exception.js";
import User from "../models/User.js";
import UserService from "../service/UserService.js";
import TfaService from "../../../service/TfaService.js";
import PermissionGroup from "../models/PermissionGroup.js";

export default class UserCommandHandler extends CommandHandler {
    constructor() {
        super();

        this.registerCommand("create", {
            help: "<username> <password> [email]",
            callback: async(args) => await this.createUser(args[0], args[1], args[2])
        });

        this.registerCommand("list", {
            help: "Lists all users",
            callback: this.listUsers
        });

        this.registerCommand("printTfaQr", {
            help: "Prints the TFA Qr Code",
            callback: (args) => this.printTfaQr(args[0])
        });

        this.registerCommand("printTfa", {
            help: "Prints the TFA Qr Code",
            callback: (args) =>  this.printTfa(args[0])
        });

        this.registerCommand("setTfaKey", {
            help: "Sets the TFA key",
            callback: (args) => this.setTfaKey(args[0], args[1])
        });

        this.registerCommand("setPermissionGroup", {
            help: "<username> <group_name>; Sets the permission group of a user",
            callback: (args) => this.setPermissionGroup(args[0], args[1])
        });

        this.registerCommand("setActive", {
            help: "Sets the active state of an user",
            callback: (args) => this.setActive(args[0], args[1])
        });
    }

    async listUsers() {
        // @ts-ignore
        let users = (await User.findAll({include: [PermissionGroup]})).map(user => `  [${user.id}]@[${user.PermissionGroup.name}] username: <${user.username}> email: <${user.email}> tfaKey: <${user.tfaKey}> active: <${user.active}>`);
        console.log("INFO", "Users: \n" + users.join("\n"));
    }

    setPermissionGroup(uid, groupName) {
        UserService.setPermissionGroup(uid, groupName);
        console.log("INFO", `Successfully changed perm-group of user [${uid}]`);
    }

    async setActive(uid, state) {
        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.USERMGMT.INVALID_USER"});
        if(!["true", "false"].includes(String(state).toLowerCase())) throw new Exception("Invalid State", {code: "CORE.INVALID_STATE"});

        await user.update({
            active: state === "true"
        });

        // @ts-ignore
        console.log("INFO", `User active state of user [${user.username}] set to [${state === "true"}]`);
    }

    async setTfaKey(uid, key) {
        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.USERMGMT.INVALID_USER"});

        let newKey = key || uuid.v4();

        await user.update({
            tfaKey: base32.encode(newKey, {type: "rfc4648"})
        });

        // @ts-ignore
        console.log("INFO", `Updated tfa key of user [${user.username}] to [${newKey}]`);
    }

    async printTfa(uid) {
        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.USERMGMT.INVALID_USER"});
        // @ts-ignore
        if(!user.tfaKey) throw new Exception("User has no TFAKey", {code: "CORE.USERMGMT.TFA_DISABLED"});

        // @ts-ignore
        let token = TfaService.getTOTP(user.tfaKey);

        // @ts-ignore
        console.log(`Current TOTP Token of user [${user.username}]: ${token}`);
    }

    async printTfaQr(uid) {
        let user = await User.findByPk(uid);
        if(!user) throw new Exception("Invalid User", {code: "CORE.USERMGMT.INVALID_USER"});
        // @ts-ignore
        if(!user.tfaKey) throw new Exception("User has no TFAKey", {code: "CORE.USERMGMT.TFA_DISABLED"});

        let issuer = "";
        try {
            issuer = JSON.parse(String(fs.readFileSync("./package.json"))).name;
        }
        catch { /** lol */ }

        // @ts-ignore
        let qr = await qrcode.toString(`otpauth://totp/${user.username}?secret=${user.tfaKey}&issuer=${issuer}`);
        console.log("INFO", qr);
        // @ts-ignore
        console.log("INFO", `Current Token: ${TfaService.getTOTP(user.tfaKey)}`);
    }

    async createUser(username, password, email = null) {
        let uid = await UserService.registerUser(username, password, email);
        console.log("INFO", `User [${uid}] created successfully.`);
    }
}
