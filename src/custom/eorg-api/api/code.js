import EorgService from "../../eorg-core/service/EorgService.js";

/**
 * @export
 * @param {import("express").Router} router
 */
export default function(router) {
    router.get("/code/:type/:resolveType?/:value?", async(req, res) => {
        res.json(await EorgService.createCode(req.params.type, req.params.resolveType, req.params.value));
    });
}
