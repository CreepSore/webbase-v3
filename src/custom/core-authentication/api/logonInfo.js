/**
 * @export
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function(req, res) {
    // @ts-ignore
    res.json({success: true, loggedIn: !!req.session.uid, uid: req.session.uid || null});
}
