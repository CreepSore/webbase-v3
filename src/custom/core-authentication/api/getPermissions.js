import Permission from "../models/Permission.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    let permGroups = await Permission.findAll();

    res.json({success: true, data: permGroups});
}
