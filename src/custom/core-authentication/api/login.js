import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    if(req.session.uid) return res.json({success: false, error: new Exception("User already logged in", {code: "CORE.AUTHENTICATION.ALREADY_LOGGED_IN"})});

    let {username, password, token} = req.body;

    try {
        let user = await UserService.loginUser(username, password, token);
        // @ts-ignore
        req.session.uid = user.id;
        return res.json({success: true});
    }
    catch (exception) {
        return res.json({success: false, error: exception});
    }
}
