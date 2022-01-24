import Profiler from "../../../service/Profiler.js";
import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";
import ApiKeyService from "../service/ApiKeyService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    if(req.session.uid) return res.json({success: false, error: new Exception("User already logged in", {code: "CORE.AUTHENTICATION.ALREADY_LOGGED_IN"})});
    let {username, password, token, apiKey} = req.body;
    let profilerToken = Profiler.instance.startMeasurement("CORE.AUTHENTICATION.LOGIN");
    Profiler.instance.addMeasurementData(profilerToken, {
        username,
        password: password?.replace?.(/./g, "*"),
        token,
        apiKey
    });

    try {
        // Handle API-Key Login
        if(apiKey) {
            let userId = await ApiKeyService.loginByApiKey(apiKey);
            if(!userId) {
                return res.json({success: false, error: new Exception("Invalid API-Key", {code: "CORE.AUTHENTICATION.INVALID_API_KEY"})});
            }

            // @ts-ignore
            req.session.uid = userId;
            Profiler.instance.addMeasurementData(profilerToken, {
                success: true
            });
            return res.json({success: true, data: {uid: userId}});
            // @ts-ignore
        }

        let user = await UserService.loginUser(username, password, token);
        // @ts-ignore
        req.session.uid = user.id;
        Profiler.instance.addMeasurementData(profilerToken, {
            success: true
        });
        // @ts-ignore
        return res.json({success: true, data: {uid: user.id}});
    }
    catch (exception) {
        Profiler.instance.addMeasurementData(profilerToken, {
            exception,
            success: false
        });
        return res.json({success: false, error: exception});
    }
    finally {
        Profiler.instance.endMeasurement(profilerToken);
    }
}
