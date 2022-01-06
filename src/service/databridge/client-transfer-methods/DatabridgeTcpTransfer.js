import net from "net";
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
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.packetHandler = {};
        this.connected = false;
    }

    connect(autoReconnect, maxConnectionTries) {
        this.autoReconnect = autoReconnect;
        this.maxConnectionTries = maxConnectionTries;

        this.setSocket(net.connect({
            host: this.host,
            port: this.port,
            timeout: 3000
        }));
    }

    disconnect(forceClose) {
        this.autoReconnect = false;
        if(!forceClose) {
            this.sendPacket(DatabridgePacketFactory.constructDisconnectPacket());
        }

        this.socket.destroy();
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     * @return {this}
     * @memberof DatabridgeTcpTransfer
     */
    sendPacket(packet) {
        if(!this.isConnected) return this;
        this.socket.write(this.dataBuilder(packet).toString("utf-8"));
        return this;
    }

    /**
     * @param {import("../DatabridgeClient.js").IDatabridgePacket} packet
     */
    onPacketReceived(packet) {
        if(this.packetHandler.ANY) {
            this.packetHandler.ANY.forEach(handler => handler(packet, this));
        }

        this.firePacketHandlers(packet.type, packet);
    }

    firePacketHandlers(type, packet) {
        if(!this.packetHandler[type]) return;
        this.packetHandler[type].forEach(handler => handler(packet, this));
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

    setSocket(socket) {
        if(this.socket) {
            try {
                this.socket.destroy();
            }
            catch { /** lol */}
        }

        let oldTries = this.maxConnectionTries;
        this.socket = socket;

        this.socket.on("ready", () => {
            this.connected = true;
            this.sendPacket(DatabridgePacketFactory.constructClientHandshakePacket());
            this.maxConnectionTries = oldTries;
        });

        this.socket.on("data", async(data) => {
            let parsedPackets = await this.dataParser(data);
            parsedPackets.forEach(packet => this.onPacketReceived(packet));
        });

        // ! Empty handler because we simply do not care
        this.socket.on("error", err => console.log("WARN", err));

        this.socket.on("close", () => {
            this.connected = false;
            if(this.autoReconnect && this.maxConnectionTries !== 0) {
                this.connect(this.autoReconnect, this.maxConnectionTries - 1);
            }
        });
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

    get isConnected() {
        return this.connected;
    }
}
