import DatabridgeHttpTransfer from "./server-transfer-methods/DatabridgeHttpTransfer.js";
import DatabridgeTcpTransfer from "./server-transfer-methods/DatabridgeTcpTransfer.js";

/**
 * @typedef {import("./types").IDatabridgePacket} IDatabridgePacket
 */

/**
 * @callback IDatabridgePacketCallback
 * @param {IDatabridgePacket} packet
 */

export default class DatabridgeServer {
    /**
     * @param {import("./types").IDatabridgeServerTransferMethod} transferMethod
     */
    constructor(transferMethod) {
        this.transferMethod = transferMethod;
        this.packetHandlers = [];
        /** @type {Object<string, Object<string, IDatabridgePacket>>} */
        this.lastPackets = {};
        this.transferMethod.addPacketHandler("ANY", (packet) => {
            if(!this.lastPackets[packet.metadata.clientId]) this.lastPackets[packet.metadata.clientId] = {};
            this.lastPackets[packet.metadata.clientId][packet.type] = packet;
        });
    }

    startListening(options) {
        this.transferMethod.startListening(options);
        return this;
    }

    stopListening(forceClose = false) {
        this.transferMethod.stopListening(forceClose);
        return this;
    }

    /**
     * @param {IDatabridgePacket} packet
     */
    sendPacket(clientId, packet) {
        this.transferMethod.sendPacket(clientId, packet);
        return this;
    }

    /**
     * @param {{router: import("express").Router, url: string}} options
     */
    static listenToHttp(options) {
        return new DatabridgeServer(new DatabridgeHttpTransfer()).startListening(options);
    }

    /**
     * @param {{host: string, port: number}} options
     */
    static listenToTcp(options) {
        return new DatabridgeServer(new DatabridgeTcpTransfer()).startListening(options);
    }
}
