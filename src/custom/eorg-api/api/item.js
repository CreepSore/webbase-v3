import EorgService from "../../eorg-core/service/EorgService.js";

/**
 * @export
 * @param {import("express").Router} router
 */
export default function(router) {
    router.get("/item", async(req, res) => {
        res.json(await EorgService.getAllItems());
    });
}
