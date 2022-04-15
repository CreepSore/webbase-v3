import EorgService from "../../eorg-core/service/EorgService.js";

/**
 * @export
 * @param {import("express").Router} router
 */
export default function(router) {
    router.get("/item", async(req, res) => {
        res.json(await EorgService.getAllItems());
    });

    router.post("/item", async(req, res) => {
        EorgService.createItem(req.body).then(itemId => {
            res.json(itemId);
        }).catch(err => {
            res.status(400).json({error: err});
        });
    });
}
