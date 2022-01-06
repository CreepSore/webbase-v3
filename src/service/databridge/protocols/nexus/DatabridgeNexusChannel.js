
export default class DatabridgeNexusChannel {
    constructor(name) {
        this.name = name;
        this._clients = new Set();
    }

    addClient(clientId) {
        this._clients.add(clientId);
    }

    removeClient(clientId) {
        this._clients.delete(clientId);
    }


    hasClient(clientId) {
        return this._clients.has(clientId);
    }

    get clients() {
        return [...this._clients];
    }
}
