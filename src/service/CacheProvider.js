
export default class CacheProvider {
    /** @type {CacheProvider} */
    static #instance;
    static get instance() {
        return this.#instance || (this.#instance = new CacheProvider());
    }

    constructor() {
        this.cache = {};
    }

    /**
     * Unregisters a cache object if it exists
     * @param {string} name
     * @return {CacheProvider}
     * @memberof CacheProvider
     */
    unregister(name) {
        delete this.cache[name];
        return this;
    }

    /**
     * Invalidates a cache object and forces it to
     * re-process the data on the next process call.
     * @param {string} name
     * @return {CacheProvider}
     * @memberof CacheProvider
     */
    invalidate(name) {
        let cacheObject = this.cache[name];
        if(!cacheObject) return this;
        cacheObject.lastFetch = 0;
        return this;
    }

    /**
     * Processes a cache object and returns its data
     * @param {string} name
     * @param {Function} callback
     * @param {number} ttlMs
     * @return {Promise<any>}
     * @memberof CacheProvider
     */
    async process(name, callback, ttlMs, reprocessCallback = null) {
        let cacheObject = this.cache[name];
        if(cacheObject) {
            let doReprocess = reprocessCallback ? await reprocessCallback() : false;
            if(!doReprocess && Date.now() - cacheObject.lastFetch < ttlMs) return cacheObject.data;
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
