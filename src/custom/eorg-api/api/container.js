// @ts-nocheck
import Container from "../../eorg-core/models/Container.js";
import EorgService from "../../eorg-core/service/EorgService.js";

import EorgException from "../../eorg-core/exceptions.js";

/**
 * @export
 * @param {import("express").Router} router
 */
export default function(router) {
    router.get("/container", async(req, res) => {
        res.json(await EorgService.getAllContainers());
    });

    router.get("/container/id/:id", async(req, res) => {
        res.json(await Container.findByPk(req.params.id));
    });

    router.post("/container/id/:id", async(req, res) => {
        let container = await Container.findByPk(req.params.id);
        if(!container) return res.json({success: false, error: EorgException.construct(EorgException.invalidContainer)});

        let {name} = req.body;
        if(name) container.name = name;

        await container.save();
        req.json({success: true});
    });

    router.get("/container/name/:name", async(req, res) => {
        res.json(await Container.findOne({where: {name: req.params.name}}));
    });
}
