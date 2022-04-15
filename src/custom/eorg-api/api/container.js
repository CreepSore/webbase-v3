// @ts-nocheck
import Container from "../../eorg-core/models/Container.js";
import EorgService from "../../eorg-core/service/EorgService.js";

import EorgException from "../../eorg-core/exceptions.js";

/**
 * @export
 * @param {import("express").Router} router
 */
export default function(router) {
    router.use(async(req, res, next) => {
        if(!req.url.includes("/container/name/")) {
            next();
            return;
        }

        let container = await Container.findOne({name: req.params.name});
        if(!container) return res.status(400).json(EorgException.construct(EorgException.invalidContainer));

        req.url = req.url.replace(/^(.*\/container)\/name\/[^/]+(.*)$/, `$1/id/${encodeURIComponent(container.id)}$2`);
        next();
    });


    router.get("/container", async(req, res) => {
        res.json(await EorgService.getAllContainers());
    });

    router.post("/container", async(req, res) => {
        Container.create({name: req.body?.name})
            .then(container => res.json(container.id))
            .catch(() => res.status(400).json(EorgException.construct(EorgException.invalidAction, "Failed to create container")));
    });

    router.get("/container/id/:id", async(req, res) => {
        res.json(await Container.findByPk(req.params.id));
    });

    router.post("/container/id/:id", async(req, res) => {
        let container = await Container.findByPk(req.params.id);
        if(!container) return res.status(400).json(EorgException.construct(EorgException.invalidContainer));

        let {name} = req.body;
        if(name) container.name = name;

        await container.save();
        req.json({success: true});
    });

    router.use("/container/id/:id/*", async(req, res, next) => {
        let container = await Container.findByPk(req.params.id);
        if(!container) return res.status(400).json(EorgException.construct(EorgException.invalidContainer));

        res.locals.container = container;
        next();
    });

    router.get("/container/id/:id/item", async(req, res) => {
        /** @type {Container} */
        let {container} = res.locals;
        if(!container) return res.status(400).json(EorgException.construct(EorgException.invalidContainer, "Invalid Container"));

        let items = await container.getItems();
        res.json(items);
    });

    router.put("/container/id/:id/item/:itemId/:itemQuantity", async(req, res) => {
        /** @type {Container} */
        let {container} = res.locals;
        let quantity = Number(req.params.itemQuantity);

        if(isNaN(quantity)) {
            return res.status(400).json(EorgException.construct(EorgException.invalidArguments, "Invalid Quantity specified"));
        }

        EorgService.addItemToContainer(container.id, {
            itemId: req.params.itemId,
            quantity
        }).then(() => {
            res.status(200).end();
        }).catch(() => {
            res.status(400).json(EorgException.construct(EorgException.invalidAction, "Failed to add item to container"));
        });
    });
}
