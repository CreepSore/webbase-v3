
export default class CacheProvider {
    static #instance;
    static get instance() {
        return this.#instance || (this.#instance = new CacheProvider());
    }

    constructor() {
        this.cache = {};
    }

    unregister(name) {
        delete this.cache[name];
        return this;
    }

    invalidate(name) {
        let cacheObject = this.cache[name];
        if(!cacheObject) return this;
        cacheObject.lastFetch = 0;
        return this;
    }

    /**
     * @param {string} name
     * @param {Function} callback
     * @param {number} ttlMs
     * @return {Promise<any>}
     * @memberof CacheProvider
     */
    async process(name, callback, ttlMs) {
        let cacheObject = this.cache[name];
        if(cacheObject) {
            if(Date.now() - cacheObject.lastFetch < ttlMs) return cacheObject.data;
            cacheObject.data = await cacheObject.callback();
            cacheObject.lastFetch = Date.now();
            return cacheObject.data;
        }

        cacheObject = this.cache[name] = {
            name,
            callback,
            ttlMs,
            lastFetch: Date.now(),
            data: await callback()
        };

        return cacheObject.data;
    }
}
