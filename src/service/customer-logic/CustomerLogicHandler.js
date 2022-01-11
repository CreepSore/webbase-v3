/**
 * @typedef {import("./types").CustomerLogicDependencies} CustomerLogicDependencies
 * @typedef {import("./CustomerLogic").default} CustomerLogic
 */

import KvpStorage from "../KvpStorage.js";
import CustomerLogicFactory from "./CustomerLogicFactory.js";

export default class CustomerLogicHandler {
    static #mainInstance;

    /**
     * @returns {CustomerLogicHandler}
     * @readonly
     * @static
     * @memberof CustomerLogicHandler
     */
    static get instance() {
        return this.#mainInstance;
    }

    constructor() {
        /** @type {Set<CustomerLogic>} */
        this.customerLogicImplementations = new Set();
        this.sharedObjects = new Map();
        // dummy object to detect non existing functions
        this.nullobj = {};
        if(!CustomerLogicHandler.#mainInstance) {
            CustomerLogicHandler.#mainInstance = this;
        }
    }

    /**
     * Returns all customer implementations sorted by highest
     * priority first
     * @return {Array<CustomerLogic>}
     * @readonly
     * @memberof CustomerLogicHandler
     */
    get sortedCustomerLogic() {
        return [...this.customerLogicImplementations].sort((a, b) => {
            if(a.getPriority() > b.getPriority()) return -1;
            if(a.getPriority() < b.getPriority()) return 1;
            return 0;
        });
    }

    /**
     * Returns all customer implementations sorted by lowest
     * priority first
     * @return {Array<CustomerLogic>}
     * @readonly
     * @memberof CustomerLogicHandler
     */
    get sortedCustomerLogicReversed() {
        return [...this.customerLogicImplementations].sort((a, b) => {
            if(a.getPriority() > b.getPriority()) return 1;
            if(a.getPriority() < b.getPriority()) return -1;
            return 0;
        });
    }

    /**
     * @property {object} additionalDependencies
     * @return {Promise<CustomerLogicDependencies>}
     * @memberof CustomerLogicHandler
     */
    async constructDependencies(additionalDependencies = {}) {
        return {
            sharedObjects: this.sharedObjects,
            storage: KvpStorage.instance,
            extensionsPath: CustomerLogicFactory.getCustomerLogicPath(),
            additionalDependencies
        };
    }

    /**
     * Registers a customer logic instance
     * This does not check if the customerLogic instance was loaded in the first place.
     * @param {CustomerLogic} customerLogic
     * @param {boolean} [load=false] If true, the customer logic instance will be loaded
     * @memberof CustomerLogicHandler
     */
    async registerCustomerLogic(customerLogic, load = false, additionalDependencies = {}) {
        if(!customerLogic) return;
        await customerLogic.injectDependencies(await this.constructDependencies(additionalDependencies));
        if(load) await this.loadCustomerLogic(customerLogic);
        this.customerLogicImplementations.add(customerLogic);
    }

    /**
     * Unregisters a customer logic instance.
     * This does not check if the customerLogic instance was loaded in the first place.
     * @param {CustomerLogic} customerLogic
     * @param {boolean} [unload=false] If true, the customer logic instance will be unloaded
     * @memberof CustomerLogicHandler
     */
    async unregisterCustomerLogic(customerLogic, unload = false) {
        if(!customerLogic) return;
        if(unload) await this.unloadCustomerLogic(customerLogic);
        this.customerLogicImplementations.delete(customerLogic);
    }

    /**
     * Loads all registered customer logic instances
     * Instances with higher priority get loaded first
     * @memberof CustomerLogicHandler
     */
    async loadAllCustomerImplementations() {
        await Promise.all(this.sortedCustomerLogic.map(customerLogic => {
            return this.loadCustomerLogic(customerLogic);
        }));
    }

    /**
     * Unloads all registered customer logic instances
     * Insances with lower priority get unloaded first
     * @param clearList If true, the list of registered customer logic instances will be cleared
     * @memberof CustomerLogicHandler
     */
    async unloadAllCustomerImplementations(clearList = false) {
        await Promise.all(this.sortedCustomerLogicReversed.map(customerLogic => {
            return this.unloadCustomerLogic(customerLogic);
        }));

        if(clearList) {
            this.customerLogicImplementations.clear();
        }
    }

    /**
     * Runs a function on all customer logic instances if the function does exist.
     * Instances with higher priority get executed first.
     * @param {string} functionName
     * @param {Array<any>} args
     * @return {Promise<Array<any>>}
     * @memberof CustomerLogicHandler
     */
    async runAllCustomerLogicFunction(functionName, ...args) {
        return (await Promise.all(this.sortedCustomerLogic.map(async customerLogic => {
            return await this.runCustomerLogicFunction(customerLogic, functionName, ...args);
        }))).filter(x => x !== this.nullobj);
    }

    /**
     * Runs a function on all customer logic instances if the function does exist.
     * Dependencies get executed first.
     * @param {string} functionName
     * @param {Array<any>} args
     * @return {Promise<Array<any>>}
     * @memberof CustomerLogicHandler
     */
    async runAllCustomerLogicFunctionDependencyFirst(functionName, ...args) {
        let executed = new Set();
        let results = new Map();
        let noDependence = [...this.customerLogicImplementations].filter(customerLogic => (customerLogic.getMetadata().dependencies || []).length === 0);
        for(let masterExtension of noDependence) {
            this.traverseRunDependencyTree(functionName, args, masterExtension, executed, results, false);
        }
        return [...results.values()];
    }

    /**
     * Recursively traverses the logic tree
     * @param {string} functionName
     * @param {any} args
     * @param {CustomerLogic} currentNode
     * @param {Set<CustomerLogic>} [executed=new Set()]
     * @param {Map<string, any>} [results=new Map()]
     * @return {Promise<any>}
     * @memberof CustomerLogicHandler
     */
    async traverseRunDependencyTree(functionName, args, currentNode, executed = new Set(), results = new Map(), upwards = false) {
        if(executed.has(currentNode)) return;
        executed.add(currentNode);
        let deps = upwards ? [...this.customerLogicImplementations].filter(cl => {
            return !executed.has(cl) && currentNode.getMetadata().dependencies.includes(cl.getMetadata().name);
        }) : [...this.customerLogicImplementations].filter(cl => {
            return !executed.has(cl) && cl.getMetadata().dependencies.includes(currentNode.getMetadata().name);
        });

        let calcResult = false;
        for(let dependency of deps) {
            await this.traverseRunDependencyTree(functionName, args, dependency, executed, results, true);
            if(!calcResult) {
                results.set(currentNode.getMetadata().name, await this.runCustomerLogicFunction(currentNode, functionName, ...args));
                calcResult = true;
            }
            await this.traverseRunDependencyTree(functionName, args, dependency, executed, results, false);
        }

        if(!calcResult) {
            results.set(currentNode.getMetadata().name, await this.runCustomerLogicFunction(currentNode, functionName, ...args));
            calcResult = true;
        }
    }

    /**
     * Runs a function on the specified customer logic instance if the function does exist.
     * @param {CustomerLogic} customerLogic
     * @param {string} functionName
     * @param {Array<any>} args
     * @return {Promise<any>}
     * @memberof CustomerLogicHandler
     */
    async runCustomerLogicFunction(customerLogic, functionName, ...args) {
        if(!customerLogic) return this.nullobj;
        if(!customerLogic[functionName]) return this.nullobj;
        return await customerLogic[functionName](...args);
    }

    /**
     * Loads a customer logic instance
     * @param {CustomerLogic} customerLogic
     * @memberof CustomerLogicHandler
     */
    async loadCustomerLogic(customerLogic) {
        if(!customerLogic || customerLogic.loaded) return;
        customerLogic.loading = true;
        for(let dependencyName of customerLogic.getMetadata().dependencies || []) {
            if(dependencyName === customerLogic.getMetadata().name) {
                console.log("ERROR", `Failed to load customer logic [${customerLogic.getMetadata().name} v${customerLogic.getMetadata().version}]: Extension tried to load itself as dependency.`);
                return;
            }
            let logic = this.getCustomerLogicByName(dependencyName);
            if(!logic) {
                console.log("ERROR", `Failed to load customer logic [${customerLogic.getMetadata().name} v${customerLogic.getMetadata().version}]: Dependency ${dependencyName} not found.`);
                return;
            }

            if(logic.loading || logic.loaded) continue;

            if(logic.loading) {
                console.log("ERROR", `Failed to load customer logic [${customerLogic.getMetadata().name} v${customerLogic.getMetadata().version}]: Circular dependency detected.`);
                return;
            }

            await this.loadCustomerLogic(logic);
        }

        console.log("INFO", `Extension [${customerLogic.getMetadata().name} v${customerLogic.getMetadata().version}] loaded.`);
        customerLogic.onLoad?.();
        customerLogic.loaded = true;
        customerLogic.loading = false;
    }

    /**
     * Unloads a customer logic instance
     * @param {CustomerLogic} customerLogic
     * @memberof CustomerLogicHandler
     */
    async unloadCustomerLogic(customerLogic) {
        customerLogic?.onUnload?.();
        customerLogic.loaded = false;
    }

    /**
     * @param {string} name
     * @returns {CustomerLogic}
     */
    getCustomerLogicByName(name) {
        return [...this.customerLogicImplementations.entries()].find(customerLogic => customerLogic[0].getMetadata().name === name)?.[0];
    }
}
