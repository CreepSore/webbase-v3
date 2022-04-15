import Setting from "../models/Setting.js";

export default class SettingsService {
    static async getRawSetting(name) {
        let setting = await Setting.findByPk(name);
        if(!setting) return null;

        // @ts-ignore
        return setting.value;
    }

    /**
     * @static
     * @template T
     * @param {string} name
     * @param {T} [defaultValue=null]
     * @return {Promise<T>}}
     * @memberof SettingsService
     */
    static async getSetting(name, defaultValue = null) {
        let settingValue = await this.getRawSetting(name);
        if(!settingValue) return defaultValue;

        try {
            return JSON.parse(settingValue);
        }
        catch {
            // this should not happen in the first place
            return defaultValue;
        }
    }

    static async setSetting(name, value) {
        return await Setting.findByPk(name).then(setting => {
            if(setting) {
                return setting.update({value: JSON.stringify(value)});
            }
            return this.createSetting(name, value);
        });
    }

    static async createSetting(name, value) {
        let [setting] = await Setting.findOrCreate({where: {name, value: JSON.stringify(value)}});
        return setting;
    }

    static async getAllSettings() {
        return await Setting.findAll({raw: true});
    }

    static async deleteSetting(name) {
        return await Setting.destroy({where: {name}});
    }
}
