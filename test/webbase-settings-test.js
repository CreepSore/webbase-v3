import * as assert from "assert";
import * as mocha from "mocha";
import TestApplication from "../src/loader/TestApplication.js";

import SettingsService from "../src/custom/core/service/SettingsService.js";

let testApp = new TestApplication();

mocha.before(async() => {
    await testApp.start();
});

mocha.after(async() => {
    await testApp.stop();
});

mocha.describe("Webbase Settings Test", function() {
    mocha.describe("should create, fetch and delete a setting", async function() {
        mocha.it("should create and delete a setting via setSetting", async function() {
            await SettingsService.setSetting("test", "bruh");
            assert.strictEqual(await SettingsService.getSetting("test", "-"), "bruh");
            await SettingsService.deleteSetting("test");
            assert.strictEqual(await SettingsService.getSetting("test", "-"), "-");
        });

        mocha.it("should create a setting via createSetting and update it via setSetting", async function() {
            let oldCount = (await SettingsService.getAllSettings()).length;
            await SettingsService.createSetting("test", "test1234");
            assert.strictEqual(await SettingsService.getSetting("test", "-"), "test1234");

            await SettingsService.setSetting("test", "bruh");
            assert.strictEqual(await SettingsService.getSetting("test", "-"), "bruh");

            assert.strictEqual((await SettingsService.getAllSettings()).length, oldCount + 1);
            await SettingsService.deleteSetting("test");
        });

        mocha.it("should not find this setting, thus returning the default value", async function() {
            assert.strictEqual(await SettingsService.getSetting("bruiuuu", "-"), "-");
        });
    });
});
