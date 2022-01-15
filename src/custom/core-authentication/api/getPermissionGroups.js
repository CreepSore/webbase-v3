import Permission from "../models/Permission.js";
import PermissionGroup from "../models/PermissionGroup.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let permGroups = await PermissionGroup.findAll({
        include: [Permission]
    });

    res.json({success: true, data: permGroups});
}
