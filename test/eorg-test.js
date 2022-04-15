import * as assert from "assert";
import * as mocha from "mocha";
import TestApplication from "../src/loader/TestApplication.js";
import EorgService from "../src/custom/eorg-core/service/EorgService.js";
import Item from "../src/custom/eorg-core/models/Item.js";
import Container from "../src/custom/eorg-core/models/Container.js";

let testApp = new TestApplication();

mocha.before(async() => {
    await testApp.start();
});

mocha.after(async() => {
    await testApp.stop();
});

mocha.describe("Eorg Test", () => {
    mocha.it("should create and delete an item", async() => {
        await EorgService.deleteItemFromAllContainers({name: "test-item"}).catch(() => {});
        await EorgService.deleteItem({name: "test-item"}).catch(() => {});
        let itemId = await EorgService.createItem({name: "test-item", description: "this is a description"});

        assert.strictEqual(Boolean(await Item.findByPk(itemId)), true);
        await EorgService.deleteItem({id: itemId});
        assert.strictEqual(Boolean(await Item.findByPk(itemId)), false);
    });

    mocha.it("should create a container with items and delete it", async() => {
        await EorgService.deleteContainer({name: "test-container"}).catch(() => {});
        await EorgService.deleteItemFromAllContainers({name: "test-item"}).catch(() => {});
        await EorgService.deleteItem({name: "test-item"}).catch(() => {});

        let testItem = await EorgService.createItem({name: "test-item", description: "this is a description"});

        let container = await EorgService.createContainer("test-container", [
            {
                itemId: testItem,
                quantity: 1
            },
            {
                itemName: "test-item",
                quantity: 1
            }
        ]).then(containerId => Container.findByPk(containerId, {include: [Item]}));

        assert.strictEqual(Boolean(container), true);

        // @ts-ignore
        assert.strictEqual(container.Items.length, 1);
        // @ts-ignore
        assert.strictEqual(container.Items.find(i => i.id === testItem).name, "test-item");

        await EorgService.deleteContainer({name: "test-container"}).catch(() => {});
        await EorgService.deleteItemFromAllContainers({name: "test-item"}).catch(() => {});
        await EorgService.deleteItem({name: "test-item"}).catch(() => {});

        // @ts-ignore
        assert.strictEqual(Boolean(await Container.findByPk(container.id)), false);
    });

    mocha.it("should create a valid code out of a container", async() => {
        await EorgService.deleteContainer({name: "test-container"}).catch(() => {});

        let container = await EorgService.createContainer("test-container").then(id => Container.findByPk(id));
        let codeId = EorgService.createCodeFromContainer(container, "id");
        let codeName = EorgService.createCodeFromContainer(container, "name");

        let decodedId = EorgService.decodeCode(codeId);
        let decodedName = EorgService.decodeCode(codeName);

        assert.deepStrictEqual(decodedId, {
            type: "container",
            resolveType: "id",
            // @ts-ignore
            value: container.id
        });

        assert.deepStrictEqual(decodedName, {
            type: "container",
            resolveType: "name",
            // @ts-ignore
            value: container.name
        });

        await EorgService.deleteContainer({name: "test-container"}).catch(() => {});
    });

    mocha.it("should create a valid code out of an item", async() => {
        await EorgService.deleteItem({name: "test-item"}).catch(() => {});

        let item = await EorgService.createItem({name: "test-item", description: "This is a description"}).then(id => Item.findByPk(id));
        let codeId = EorgService.createCodeFromItem(item, "id");
        let codeName = EorgService.createCodeFromItem(item, "name");

        let decodedId = EorgService.decodeCode(codeId);
        let decodedName = EorgService.decodeCode(codeName);

        assert.deepStrictEqual(decodedId, {
            type: "item",
            resolveType: "id",
            // @ts-ignore
            value: item.id
        });

        assert.deepStrictEqual(decodedName, {
            type: "item",
            resolveType: "name",
            // @ts-ignore
            value: item.name
        });

        await EorgService.deleteItem({name: "test-item"}).catch(() => {});
    });

    mocha.it("should successfully create and decode a code", async() => {
        let code = EorgService.createCode("testcode", "resolvetype", "value lmao");
        assert.deepStrictEqual(EorgService.decodeCode(code), {
            type: "testcode",
            resolveType: "resolvetype",
            value: "value lmao"
        });
    });
});

