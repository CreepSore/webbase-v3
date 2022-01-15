import Exception from "../../core/Exception.js";
import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let permGroup = await PermissionGroup.findOne({where: {id: req.params.id}});
    if(!permGroup) {
        res.json({success: false, error: new Exception("Permission group not found", {code: "CORE.AUTHENTICATION.PERMGROUP_NOT_FOUND"})});
        return;
    }

    let permissions = await Permission.findAll({where: {id: req.body}});
    // @ts-ignore
    await permGroup.setPermissions(permissions);

    res.json({success: true});
}
