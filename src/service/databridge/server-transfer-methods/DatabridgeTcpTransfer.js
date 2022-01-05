import net from "net";

import * as uuid from "uuid";

import DatabridgePacketFactory from "../DatabridgePacketFactory.js";

/**
 * @typedef {import("../types").IDatabridgeClientTransferMethod} IDatabridgeTransferMethod
 */

/**
 *
 * @export
 * @class DatabridgeHttpTransfer
 * @extends {IDatabridgeTransferMethod}
 */
export default class DatabridgeTcpTransfer {
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
        this.eventHandlers = {};
        this.connected = false;
        /** @type {Object<string, net.Socket>} */
        this.clients = {};
    }

    startListening(options) {
        this.serverSocket = net.createServer(socket => {
            let clientId = uuid.v4();
            this.clients[clientId] = socket;

            this.eventHandlers.CONNECT?.forEach(handler => handler(clientId));

            socket.on("data", async(data) => {
                let parsedPackets = await this.dataParser(data);
                parsedPackets.forEach(packet => {
                    packet.metadata = packet.metadata || {};
                    packet.metadata.clientId = clientId;
                    this.onPacketReceived(packet);
                });
            });

            socket.on("close", () => {
                delete this.clients[clientId];
                this.eventHandlers.DISCONNECT?.forEach(handler => handler(clientId));
            });

            socket.on("error", err => console.log("WARN", err));

            socket.on("end", () => {
                delete this.clients[clientId];
            });
        });

        this.serverSocket.listen(options.port, options.host);
    }

    stopListening() {
        Object.entries(this.clients).forEach(([, socket]) => {
            socket.destroy();
        });
        this.serverSocket.close();
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     * @return {this}
     * @memberof DatabridgeTcpTransfer
     */
    sendPacket(clientId, packet) {
        let socket = this.clients[clientId];
        if(!socket) return this;
        socket.write(this.dataBuilder(packet).toString("utf-8"));
        return this;
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

    dataParser(data) {
        return new Promise((res) => {
            let packets = [];
            data.toString("utf-8").split("\n").forEach(packet => {
                try {
                    let parsed = JSON.parse(String(packet));
                    if(!parsed.id) return;
                    if(!parsed.type) return;
                    if(!parsed.data) return;

                    packets.push(parsed);
                }
                catch {
                    // ! lol
                }
            });
            res(packets);
        });
    }

    /**
     * @param {IDatabridgeTransferMethod["dataParser"]} dataParser
     * @memberof DatabridgeTcpTransfer
     */
    setDataParser(dataParser) {
        this.dataParser = dataParser;
    }

    setDataBuilder(dataBuilder) {
        this.dataBuilder = dataBuilder;
    }

    dataBuilder(packet) {
        return Buffer.from(`${JSON.stringify(packet)}\n`);
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

    addConnectHandler(callback) {
        if(!this.eventHandlers.CONNECT) {
            this.eventHandlers.CONNECT = [];
        }
        this.eventHandlers.CONNECT.push(callback);
    }

    removeConnectHandler(callback) {
        this.eventHandlers.CONNECT = this.eventHandlers.CONNECT.filter(handler => handler !== callback);
    }

    addDisconnectHandler(callback) {
        if(!this.eventHandlers.DISCONNECT) {
            this.eventHandlers.DISCONNECT = [];
        }
        this.eventHandlers.DISCONNECT.push(callback);
    }

    removeDisconnectHandler(callback) {
        this.eventHandlers.DISCONNECT = this.eventHandlers.DISCONNECT.filter(handler => handler !== callback);
    }

    get isConnected() {
        return this.connected;
    }
}
