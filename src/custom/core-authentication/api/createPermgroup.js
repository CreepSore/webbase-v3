import Exception from "../../core/Exception.js";
import PermissionGroup from "../models/PermissionGroup.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let {name, description} = req.body;
    let permGroup = await PermissionGroup.findOne({where: {name}});

    if(permGroup) {
        res.json({success: false, error: new Exception("Permission group already exists", {code: "CORE.AUTHENTICATION.PERMGROUP_ALREADY_EXISTS"})});
        return;
    }

    try {
        await PermissionGroup.create({
            name,
            description
        });

        res.json({success: true});
    }
    catch(error) {
        res.json({success: false, error});
    }
}
