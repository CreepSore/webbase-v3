import Profiler from "../../../service/Profiler.js";
import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";
import CacheProvider from "../../../service/CacheProvider.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let {username, password, email} = req.body;
    if(!username || !password || !email) return res.json({success: false, error: new Exception("Invalid Input", {code: "CORE.AUTHENTICATION.INVALID_INPUT"})});
    let profilerToken = Profiler.instance.startMeasurement("CORE.AUTHENTICATION.REGISTER");
    Profiler.instance.addMeasurementData(profilerToken, {
        username,
        email,
        password: password.replace(/./g, "*")
    });

    try {
        let user = await UserService.registerUser(username, password, email, null, false);
        // @ts-ignore
        res.json({success: true, uid: user.id, active: user.active});
    }
    catch(error) {
        res.json({success: false, error});
    }
    finally {
        CacheProvider.instance.invalidate("CORE.AUTHENTICATION.GETUSERS");
        Profiler.instance.endMeasurement(profilerToken);
    }
}
