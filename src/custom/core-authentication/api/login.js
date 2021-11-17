import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";

export default function(req, res) {
    let {username, password, token} = req.body;

    let user = UserService.getUserByCredentials(username, password);
    if(!user) return res.json({success: false, error: new Exception("Invalid Credentials", {code: "CORE.AUTHENTICATION.INVALID_CREDENTIALS"})});
    // @ts-ignore
    if(!UserService.checkTfa(user.id, token)) {
        return res.json({
            success: false,
            error: token
                ? new Exception("Invalid TOTP Token", {code: "CORE.AUTHENTICATION.INVALID_TOKEN"})
                : new Exception("No TOTP Token specified", {code: "CORE.AUTHENTICATION.NO_TOKEN"})
        });
    }

    return res.json({success: true});
}
