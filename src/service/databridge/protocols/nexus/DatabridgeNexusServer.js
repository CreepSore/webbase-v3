import DatabridgePacketFactory from "../../DatabridgePacketFactory.js";
import DatabridgeNexusChannel from "./DatabridgeNexusChannel.js";

export default class DatabridgeNexusServer {
    /**
     * Creates an instance of DatabridgeNexusServer.
     * @param {import("../../DatabridgeServer").default} databridge
     * @param {{createChannelOnSubscribe?: boolean, deleteChannelsWithoutSubscribers?: boolean}} options
     * @memberof DatabridgeNexusServer
     */
    constructor(databridge, options = {}) {
        this.databridge = databridge;
        this.options = options;

        this.databridge.transferMethod.addPacketHandler("ANY", (packet, transfer) => this.onPacketReceived(packet, transfer));
        /** @type {Object<string, DatabridgeNexusChannel>} */
        this.channels = {};
    }

    createChannel(name) {
        if(this.channels[name]) return false;
        this.channels[name] = new DatabridgeNexusChannel(name);
        return true;
    }

    /**
     * @param {string} channel
     * @param {import("../../types").IDatabridgePacket} packet
     */
    broadcastPacket(channel, packet, blacklistFilter = []) {
        let nexusChannel = this.channels[channel];
        if(!nexusChannel) return false;

        nexusChannel.clients.filter((client) => !blacklistFilter.includes(client)).forEach(clientId => {
            this.databridge.sendPacket(clientId, DatabridgePacketFactory.constructPacket("NEXUS_BROADCAST", {
                channel,
                packet
            }));
        });

        return true;
    }

    // eslint-disable-next-line no-unused-vars
    onPacketReceived(packet, transferMethod) {
        if(packet.type === "NEXUS_SUBSCRIBE") {
            let nexusChannel = this.channels[packet.data.channel];
            if(!nexusChannel) {
                if(this.options.createChannelOnSubscribe) {
                    this.createChannel(packet.data.channel);
                    nexusChannel = this.channels[packet.data.channel];
                }
                else {
                    return;
                }
            }

            nexusChannel.addClient(packet.metadata.clientId);
        }

        if(packet.type === "NEXUS_UNSUBSCRIBE") {
            let nexusChannel = this.channels[packet.data.channel];
            if(!nexusChannel) return;

            nexusChannel.removeClient(packet.metadata.clientId);

            if(this.options.deleteChannelsWithoutSubscribers && nexusChannel.clients.length === 0) {
                delete this.channels[packet.data.channel];
            }
        }

        if(packet.type === "NEXUS_BROADCAST") {
            let nexusChannel = this.channels[packet.data.channel];
            if(!nexusChannel) return;
            if(!nexusChannel.hasClient(packet.metadata.clientId)) return;

            this.broadcastPacket(packet.data.channel, packet.data.packet, [packet.metadata.clientId]);
        }
    }

    async start(options) {
        this.databridge.startListening(options);
    }

    async stop(forceClose) {
        this.databridge.stopListening(forceClose);
    }
}
