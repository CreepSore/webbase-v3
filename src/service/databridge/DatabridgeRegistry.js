
export default class DatabridgeRegistry {
    /** @type {DatabridgeRegistry} */
    static #instance;
    static get instance() {
        return this.#instance || (this.#instance = new this());
    }

    constructor() {
        this._clients = [];
        this._servers = [];
    }

    setClient(name, client) {
        this._clients[name] = client;
    }

    setServer(name, server) {
        this._servers[name] = server;
    }

    getClientByName(name) {
        return this._servers[name];
    }

    getServerByName(name) {
        return this._servers[name];
    }
}
