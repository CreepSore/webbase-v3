import WebSocket from "ws";
import DatabridgePacketFactory from "../DatabridgePacketFactory.js";

/**
 * @typedef {import("../types").IDatabridgeTransferMethod} IDatabridgeTransferMethod
 */

/**
 *
 * @export
 * @class DatabridgeHttpTransfer
 */
export default class DatabridgeHttpTransfer {
    constructor(url) {
        this.url = url;
        this.packetHandler = {};
    }

    connect(autoReconnect, maxConnectionTries) {
        this.autoReconnect = autoReconnect;
        this.maxConnectionTries = maxConnectionTries;

        this.socket = new WebSocket(this.url, {
            handshakeTimeout: 3000
        });

        this.socket.on("open", () => {
            this.sendPacket(DatabridgePacketFactory.constructClientHandshakePacket());
            this.maxConnectionTries = maxConnectionTries;
        });

        this.socket.on("message", (data) => {
            try {
                let parsed = JSON.parse(String(data));
                if(!parsed.id) return;
                if(!parsed.type) return;
                if(!parsed.data) return;

                this.onPacketReceived(parsed);
            }
            catch {
                // ! lol
            }
        });

        // ! Empty handler because we simply do not care
        this.socket.on("error", () => {});

        this.socket.on("close", () => {
            if(this.autoReconnect && this.maxConnectionTries !== 0) {
                this.connect(this.autoReconnect, this.maxConnectionTries - 1);
            }
        });
    }

    disconnect(forceClose) {
        this.autoReconnect = false;
        if(!forceClose) {
            this.sendPacket(DatabridgePacketFactory.constructDisconnectPacket());
        }

        this.socket.close();
    }

    sendPacket(packet) {
        if(!this.isConnected) return;
        this.socket.send(JSON.stringify(packet));
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     */
    onPacketReceived(packet) {
        if(this.packetHandler.ANY) {
            this.packetHandler.ANY.forEach(handler => handler(packet, this));
        }

        if(!this.packetHandler[packet.type]) return;
        this.packetHandler[packet.type].forEach(handler => handler(packet, this));
    }

    addPacketHandler(type, handler) {
        if(!this.packetHandler[type]) {
            this.packetHandler[type] = [];
        }
        this.packetHandler[type].push(handler);
    }

    get isConnected() {
        return this.socket.readyState === WebSocket.OPEN;
    }
}
