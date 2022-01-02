import WebSocket from "ws";
import DatabridgePacketFactory from "../DatabridgePacketFactory.js";

/**
 * @typedef {import("../types").IDatabridgeClientTransferMethod} IDatabridgeClientTransferMethod
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
        /** @type {WebSocket} */
        this.socket = null;
    }

    connect(autoReconnect, maxConnectionTries) {
        this.autoReconnect = autoReconnect;
        this.maxConnectionTries = maxConnectionTries;

        this.setSocket(new WebSocket(this.url, {
            handshakeTimeout: 3000
        }));
    }

    disconnect(forceClose) {
        this.autoReconnect = false;
        if(!forceClose) {
            this.sendPacket(DatabridgePacketFactory.constructDisconnectPacket());
        }

        this.socket.close();
    }

    sendPacket(packet) {
        if(!this.isConnected) return this;
        this.socket.send(this.dataBuilder(packet).toString("utf-8"));
        return this;
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     */
    onPacketReceived(packet) {
        packet.metadata = {
            receivedAt: new Date()
        };

        if(this.packetHandler.ANY) {
            this.packetHandler.ANY.forEach(handler => handler(packet, this));
        }

        if(!this.packetHandler[packet.type]) return;
        this.packetHandler[packet.type].forEach(handler => handler(packet, this));
    }

    async dataParser(data) {
        try {
            let parsed = JSON.parse(String(data));
            if(!parsed.id) return [];
            if(!parsed.type) return [];
            if(!parsed.data) return [];

            return [parsed];
        }
        catch {
            // ! lol
        }
        return [];
    }

    setDataParser(dataParser) {
        this.dataParser = dataParser;
    }

    setSocket(socket) {
        if(this.socket) {
            try {
                this.socket.close();
            }
            catch { /** lol */}
        }

        let oldTries = this.maxConnectionTries;
        this.socket = socket;

        this.socket.on("open", () => {
            this.sendPacket(DatabridgePacketFactory.constructClientHandshakePacket());
            this.maxConnectionTries = oldTries;
        });

        this.socket.on("message", async(data) => {
            let packets = await this.dataParser(data);
            packets.forEach(packet => this.onPacketReceived(packet));
        });

        // ! Empty handler because we simply do not care
        this.socket.on("error", (err) => console.log("WARN", err));

        this.socket.on("close", () => {
            if(this.autoReconnect && this.maxConnectionTries !== 0) {
                this.connect(this.autoReconnect, this.maxConnectionTries - 1);
            }
        });
    }

    setDataBuilder(dataBuilder) {
        this.dataBuilder = dataBuilder;
    }

    dataBuilder(packet) {
        return Buffer.from(JSON.stringify(packet));
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
