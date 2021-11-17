import Exception from "../../core/Exception.js";

/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    if(!req.session.uid) return res.json({success: false, error: new Exception("User not logged in", {code: "CORE.AUTHENTICATION.NO_LOGON"})});

    // @ts-ignore
    delete req.session.uid;

    res.json({success: true});
}
