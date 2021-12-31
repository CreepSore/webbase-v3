import * as uuid from "uuid";

export default class DatabridgePacketFactory {
    /**
     * @static
     * @return {import("./types").IClientHandshakePacket}
     * @memberof DatabridgePacketFactory
     */
    static constructClientHandshakePacket() {
        return this.constructPacket("HANDSHAKE", {});
    }

    /**
     * @static
     * @param {number} clientId
     * @return {import("./types").IServerHandshakePacket}
     * @memberof DatabridgePacketFactory
     */
    static constructServerHandshakePacket(clientId) {
        return this.constructPacket("HANDSHAKE", {
            clientId
        });
    }

    /**
     * @static
     * @param {number} time if set to < 0, automatically sets the time to the current time
     * @return {import("./types").IPingPacket}
     * @memberof DatabridgePacketFactory
     */
    static constructPingPacket(time = -1) {
        return this.constructPacket("PING", {
            time: time < 0 ? Date.now() : time
        });
    }

    /**
     * @static
     * @return {import("./types").IDisconnectPacket}
     * @memberof DatabridgePacketFactory
     */
    static constructDisconnectPacket() {
        return this.constructPacket("DISCONNECT", {});
    }

    /**
     * @param {any} data
     * @returns IDatabridgePacket
     */
    static constructPacket(type, data) {
        let id = uuid.v4();
        return {
            id,
            type,
            data
        };
    }
}
