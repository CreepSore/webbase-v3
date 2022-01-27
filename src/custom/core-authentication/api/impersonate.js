import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    if(!req.session.uid) return res.json({success: false, error: new Exception("User not logged in", {code: "CORE.AUTHENTICATION.NO_LOGON"})});

    if(!(await UserService.getUserByUid(req.params.uid))) {
        res.json({success: false, error: new Exception("User not found", {code: "CORE.AUTHENTICATION.USER_NOT_FOUND"})});
    }

    // @ts-ignore
    req.session.uid = req.params.uid;

    res.json({success: true, data: {uid: req.params.uid}});
}
