import net from "net";
import DatabridgePacketFactory from "../DatabridgePacketFactory.js";

/**
 * @typedef {import("../types").IDatabridgeTransferMethod} IDatabridgeTransferMethod
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

        this.socket = net.connect({
            host: this.host,
            port: this.port,
            timeout: 3000
        });

        this.socket.on("ready", () => {
            this.connected = true;
            this.sendPacket(DatabridgePacketFactory.constructClientHandshakePacket());
            this.maxConnectionTries = maxConnectionTries;
        });

        this.socket.on("data", (data) => {
            data.toString("utf-8").split("\n").forEach(packet => {
                try {
                    let parsed = JSON.parse(String(packet));
                    if(!parsed.id) return;
                    if(!parsed.type) return;
                    if(!parsed.data) return;

                    this.onPacketReceived(parsed);
                }
                catch {
                    // ! lol
                }
            });
        });

        // ! Empty handler because we simply do not care
        this.socket.on("error", err => console.log(err));

        this.socket.on("close", () => {
            this.connected = false;
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

        this.socket.destroy();
    }

    sendPacket(packet) {
        if(!this.isConnected) return;
        this.socket.write(`${JSON.stringify(packet)}\n`);
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
        return this.connected;
    }
}
