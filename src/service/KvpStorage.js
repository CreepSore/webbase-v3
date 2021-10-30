
class KvpStorageWrapper {
    constructor(storage) {
        /** @type {KvpStorage} */
        this.storage = storage;
        this.defaultKeys = KvpStorageWrapper.defaultKeys;
    }

    static get defaultKeys() {
        return {
            express: "EXPRESS",
            sequelize: "SEQUELIZE",
            config: "CONFIG"
        };
    }

    /** @returns {import("express").Application} */
    getExpress() {
        return this.storage.getItem(this.defaultKeys.express);
    }

    /** @returns {import("sequelize").Sequelize} */
    getSequelize() {
        return this.storage.getItem(this.defaultKeys.sequelize);
    }

    /** @returns {import("./ConfigModel").default} */
    getConfig() {
        return this.storage.getItem(this.defaultKeys.config);
    }
}

export default class KvpStorage {
    /** @type {KvpStorage} */
    static #instance;

    static get instance() {
        return this.#instance || (this.#instance = new this());
    }

    static get defaultKeys() {
        return KvpStorageWrapper.defaultKeys;
    }

    /** @type {Map<string, object>} */
    #storage;
    /** @type {KvpStorageWrapper} */
    #wrapper;

    get wrapper() {
        return this.#wrapper || (this.#wrapper = new KvpStorageWrapper(this));
    }

    constructor() {
        this.#storage = new Map();
    }

    setItem(key, value) {
        this.#storage.set(key, value);
    }

    getItem(key) {
        if(!this.#storage.has(key)) {
            return new Error(`Key ${key} not found`);
        }
        return this.#storage.get(key);
    }

    getItemOrDefault(key, defaultValue) {
        if (this.#storage.has(key)) {
            return this.#storage.get(key);
        }
        return defaultValue;
    }

    hasItem(key) {
        return this.#storage.has(key);
    }

    removeItem(key) {
        this.#storage.delete(key);
    }
}
