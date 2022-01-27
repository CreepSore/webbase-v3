import PermissionGroup from "../models/PermissionGroup.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

import PermissionService from "../service/PermissionService.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    if(!res.locals.user?.id) {
        let anonymousPermissions = await PermissionService.getAnonymousPermissions();
        res.json({success: true, data: anonymousPermissions.map(p => p.name)});
        return;
    }

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
