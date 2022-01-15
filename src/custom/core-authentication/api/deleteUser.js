import CacheProvider from "../../../service/CacheProvider.js";
import UserService from "../service/UserService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    UserService.deleteUser(req.params.uid);
    CacheProvider.instance.invalidate("CORE.AUTHENTICATION.GETUSERS");
    res.json({success: true});
}
