import * as uuid from "uuid";

import DatabridgePacketFactory from "../DatabridgePacketFactory.js";

/**
 * @typedef {import("../types").IDatabridgeServerTransferMethod} IDatabridgeServerTransferMethod
 */

/**
 *
 * @export
 * @class DatabridgeHttpTransfer
 */
export default class DatabridgeHttpTransfer {
    constructor() {
        this.packetHandler = {
            HANDSHAKE: [
                (packet) => {
                    let {clientId} = packet.metadata;
                    this.sendPacket(clientId, DatabridgePacketFactory.constructServerHandshakePacket(clientId));
                }
            ],
            PING: [
                (packet) => {
                    let {clientId} = packet.metadata;
                    this.sendPacket(clientId, DatabridgePacketFactory.constructPingPacket());
                }
            ]
        };
        this.clients = {};
    }

    startListening(options) {
        options.router.ws(options.url, (/** @type {import("ws").WebSocket} */ ws) => {
            let clientId = uuid.v4();
            this.clients[clientId] = ws;

            console.log("WEBINFO", `Client [${clientId}] connected to DataBridge`);

            ws.on("message", async(data) => {
                let packets = await this.dataParser(data);
                packets.forEach(packet => {
                    packet.metadata = packet.metadata || {};
                    packet.metadata.clientId = clientId;
                    this.onPacketReceived(packet);
                });
            });

            ws.on("end", () => {
                delete this.clients[clientId];
                console.log("WEBINFO", `Client [${clientId}] disconnected from DataBridge`);
            });

            ws.on("error", () => {});
        });
    }

    stopListening() {
        console.log("WARN", "Can't stop listening on HTTP transfer method");
    }

    sendPacket(clientId, packet) {
        let socket = this.clients[clientId];
        if(!socket) return;
        socket.send(this.dataBuilder(packet).toString("utf-8"));
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     */
    onPacketReceived(packet) {
        packet.metadata = packet.metadata || {};
        packet.metadata.receivedAt = new Date();

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

    setDataBuilder(dataBuilder) {
        this.dataBuilder = dataBuilder;
    }

    dataBuilder(packet) {
        return Buffer.from(JSON.stringify(packet));
    }

    setDataParser(dataParser) {
        this.dataParser = dataParser;
    }

    addPacketHandler(type, handler) {
        if(!this.packetHandler[type]) {
            this.packetHandler[type] = [];
        }
        this.packetHandler[type].push(handler);
    }

    removePacketHandler(callback) {
        for(let type in this.packetHandler) {
            this.packetHandler[type] = this.packetHandler[type].filter(handler => handler !== callback);
        }
    }
}
