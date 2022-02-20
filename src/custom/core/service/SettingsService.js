import Setting from "../models/Setting.js";

export default class SettingsService {
    static async getRawSetting(name, defaultValue = null) {
        let setting = await Setting.findByPk(name);
        if(!setting) return defaultValue;

        // @ts-ignore
        return setting.value;
    }

    static async getSetting(name, defaultValue = null) {
        let settingValue = await this.getRawSetting(name, defaultValue);
        if(!settingValue) return defaultValue;

        try {
            return JSON.parse(settingValue);
        }
        catch {
            return defaultValue;
        }
    }

    static async setSetting(name, value) {
        return await Setting.findByPk(name).then(setting => {
            if(setting) {
                return setting.update({value: JSON.stringify({value})});
            }
            return this.createSetting(name, JSON.stringify({value}));
        });
    }

    static async createSetting(name, value) {
        let [setting] = await Setting.findOrCreate({where: {name, value: JSON.stringify(value)}});
        return setting;
    }

    static async getAllSettings() {
        return await Setting.findAll({raw: true});
    }
}
