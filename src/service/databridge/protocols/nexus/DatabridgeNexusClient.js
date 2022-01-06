import DatabridgePacketFactory from "../../DatabridgePacketFactory.js";

export default class DatabridgeNexusClient {
    /**
     * Creates an instance of DatabridgeNexusServer.
     * @param {import("../../DatabridgeClient").default} databridge
     * @memberof DatabridgeNexusClient
     */
    constructor(databridge) {
        this.databridge = databridge;
        this.databridge.transferMethod.addPacketHandler("NEXUS_BROADCAST", (packet) => {
            this.databridge.transferMethod.firePacketHandlers(`C::${packet.data.channel}`, packet.data.packet);
            this.databridge.transferMethod.firePacketHandlers(`C::${packet.data.channel}::${packet.data.packet.type}`, packet.data.packet);
        });
    }

    /**
     * @param {string} channel
     * @param {import("../../types").IDatabridgePacket} packet
     */
    broadcastPacket(channel, packet) {
        this.databridge.sendPacket(DatabridgePacketFactory.constructPacket("NEXUS_BROADCAST", {
            channel,
            packet
        }));

        return true;
    }

    subscribeToChannel(channel) {
        this.databridge.sendPacket(DatabridgePacketFactory.constructPacket("NEXUS_SUBSCRIBE", {
            channel
        }));
    }

    unsubscribeFromChannel(channel) {
        this.databridge.sendPacket(DatabridgePacketFactory.constructPacket("NEXUS_UNSUBSCRIBE", {
            channel
        }));
    }

    /**
     * @param {string} channel
     * @param {(packet: (import("../../DatabridgeClient").IDatabridgePacket)) => void} handler
     * @memberof DatabridgeNexusClient
     */
    addChannelPacketHandler(channel, handler) {
        this.databridge.transferMethod.addPacketHandler(`C::${channel}`, handler);
    }

    /**
     * @param {string} channel
     * @param {string} packetType
     * @param {(packet: (import("../../DatabridgeClient").IDatabridgePacket)) => void} handler
     * @memberof DatabridgeNexusClient
     */
    addPacketHandler(channel, packetType, handler) {
        this.databridge.transferMethod.addPacketHandler(`C::${channel}::${packetType}`, handler);
    }

    async start(autoReconnect, maxConnectionTries) {
        this.databridge.connect(autoReconnect, maxConnectionTries);
    }

    async stop(forceClose) {
        this.databridge.disconnect(forceClose);
    }
}
