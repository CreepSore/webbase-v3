import PermissionGroup from "../models/PermissionGroup.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

import Exception from "../../core/Exception.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    if(!res.locals.user?.id) return res.json({success: false, error: new Exception("User not logged in", {code: "CORE.AUTHENTICATION.NOT_LOGGED_IN"})});

    let user = await User.findOne({
        where: {
            id: res.locals.user.id
        },
        include: [{
            model: PermissionGroup,
            include: [{
                model: Permission
            }]
        }]
    });

    // @ts-ignore
    let permissions = user.PermissionGroup.Permissions.map(perm => {
        return perm.name;
    });

    res.json({success: true, data: permissions});
}
