import DatabridgeHttpTransfer from "./transfer-methods/DatabridgeHttpTransfer.js";
import DatabridgeTcpTransfer from "./transfer-methods/DatabridgeTcpTransfer.js";

/**
 * @typedef {import("./types").IDatabridgePacket} IDatabridgePacket
 */

/**
 * @callback IDatabridgePacketCallback
 * @param {IDatabridgePacket} packet
 */

export default class DatabridgeClient {
    /**
     * @param {import("./types").IDatabridgeTransferMethod} transferMethod
     */
    constructor(transferMethod) {
        this.transferMethod = transferMethod;
        this.packetHandlers = [];
    }

    /**
     * @param {boolean} [autoReconnect=false] specifies if the databridge should try to reconnect automatically
     * @param {number} [maxConnectionTries=-1] if set to -1 it will try to reconnect forever, otherwise it will try to reconnect n times
     * @return {this}
     * @memberof Databridge
     */
    connect(autoReconnect = false, maxConnectionTries = -1) {
        this.transferMethod.connect(autoReconnect, maxConnectionTries);
        return this;
    }

    disconnect(forceClose = false) {
        this.transferMethod.disconnect(forceClose);
        return this;
    }

    /**
     * @param {IDatabridgePacket} packet
     */
    sendPacket(packet) {
        if(!this.transferMethod.isConnected) return false;
        this.transferMethod.sendPacket(packet);
        return true;
    }

    static connectToHttp(url, autoReconnect = undefined, maxConnectionTries = undefined) {
        return new DatabridgeClient(new DatabridgeHttpTransfer(url)).connect(autoReconnect, maxConnectionTries);
    }

    static connectToTcp(host, port, autoReconnect = undefined, maxConnectionTries = undefined) {
        return new DatabridgeClient(new DatabridgeTcpTransfer(host, port)).connect(autoReconnect, maxConnectionTries);
    }
}
