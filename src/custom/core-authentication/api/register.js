import Exception from "../../core/Exception.js";
import UserService from "../service/UserService.js";

export default async function(req, res) {
    let {username, password, email} = req.body;
    if(!username || !password || !email) return res.json({success: false, error: new Exception("Invalid Input", {code: "CORE.USERMGMT.INVALID_INPUT"})});

    try {
        let user = await UserService.registerUser(username, password, email);
        // @ts-ignore
        res.json({success: true, uid: user.id, active: user.active});
    }
    catch(ex) {
        res.json({success: false, error: ex});
    }
}
