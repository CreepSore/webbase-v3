import Profiler from "./Profiler.js";

/**
 * @callback ProcessCallback
 * @returns {T}
 * @template T
 */

/**
 * @typedef {Object} CacheObject
 * @property {string} name
 * @property {ProcessCallback<T>} callback
 * @property {number} ttlMs
 * @property {number} lastFetch
 * @property {T} data
 * @template T
 */

export default class CacheProvider {
    /** @type {CacheProvider} */
    static #instance;
    static get instance() {
        return this.#instance || (this.#instance = new CacheProvider());
    }

    constructor() {
        /** @type {Object<string, CacheObject<any>>} */
        this.cache = {};
        /** @type {Object<string, Function[]>} */
        this.listeners = {};
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

    addListener(name, callback) {
        this.listeners[name] = this.listeners[name] || [];
        this.listeners[name].push(callback);
    }

    /**
     * Processes a cache object and returns its data
     * @param {string} name
     * @param {ProcessCallback<T>} callback
     * @param {number} ttlMs
     * @return {Promise<T>}
     * @memberof CacheProvider
     * @template T
     */
    async process(name, callback, ttlMs, reprocessCallback = null) {
        let cacheObject = this.cache[name];
        let profilerId = Profiler.instance.startMeasurement(`CACHE.${name}`, {ttlMs});

        if(!cacheObject) {
            cacheObject = this.cache[name] = {
                name,
                callback,
                ttlMs,
                lastFetch: Date.now(),
                data: await callback()
            };
            let copiedCacheObject = {...cacheObject};
            this.listeners[name]?.forEach?.(listener => listener(this.cache[name].data));

            Profiler.instance
                .addMeasurementData(profilerId, {
                    cacheObject: copiedCacheObject,
                    preprocessed: false
                }).endMeasurement(profilerId);

            return cacheObject.data;
        }

        let doReprocess = reprocessCallback ? await reprocessCallback() : false;
        if(!doReprocess && Date.now() - cacheObject.lastFetch < ttlMs) {
            let copiedCacheObject = {...cacheObject};
            Profiler.instance
                .addMeasurementData(profilerId, {
                    cacheObject: copiedCacheObject,
                    preprocessed: true
                }).endMeasurement(profilerId);
            return cacheObject.data;
        }
        cacheObject.data = await cacheObject.callback();
        cacheObject.lastFetch = Date.now();

        let copiedCacheObject = {...cacheObject};

        this.listeners[name]?.forEach?.(listener => listener(copiedCacheObject.data));

        Profiler.instance
            .addMeasurementData(profilerId, {
                cacheObject: copiedCacheObject,
                preprocessed: false
            })
            .endMeasurement(profilerId);

        return cacheObject.data;
    }
}
