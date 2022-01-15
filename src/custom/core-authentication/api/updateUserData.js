import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";
import CacheProvider from "../../../service/CacheProvider.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    let isAdvanced = await UserService.hasPermission(req.session.uid, "CORE.AUTHENTICATION.EDIT.USER.BASIC.ADVANCED");
    let hasHandled = false;

    // @ts-ignore
    if(!isAdvanced && req.params.uid !== req.session.uid) {
        res.json({success: false, error: new Exception("Invalid Permissions", {code: "CORE.API.INVALID_PERMISSIONS"})});
        return;
    }

    try {
        // @ts-ignore
        if(await UserService.hasPermission(req.session.uid, "CORE.AUTHENTICATION.EDIT.USER.BASIC")) {
            await UserService.updateUserInformationBasic(req.params.uid, req.body.email, req.body.password);
            hasHandled = true;
        }

        if(isAdvanced) {
            await UserService.updateUserInformationAdvanced(req.params.uid, req.body.username, req.body.tfaKey, req.body.active, req.body.permissionGroup);
            hasHandled = true;
        }
    }
    catch(ex) {
        res.json({success: false, error: ex});
        return;
    }

    if(!hasHandled) {
        res.json({success: false, error: new Exception("Invalid Permissions", {code: "CORE.API.INVALID_PERMISSIONS"})});
        return;
    }

    CacheProvider.instance.invalidate("CORE.AUTHENTICATION.GETUSERS");
    res.json({success: true});
}
