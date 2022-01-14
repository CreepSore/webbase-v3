import CacheProvider from "../../../service/CacheProvider.js";
import UserService from "../service/UserService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let users = await CacheProvider.instance.process("CORE.AUTHENTICATION.GETUSERS", () => {
        return UserService.getUsers();
    }, 60000);

    res.json({success: true, data: users});
}
