import DatabridgeHttpTransfer from "./transfer-methods/DatabridgeHttpTransfer";

export interface IDatabridgePacket<PacketType, DataType> {
    id: string;
    type: PacketType;
    data: DataType;
}

export interface IClientHandshakePacket extends IDatabridgePacket<"HANDSHAKE", {}> {}
export interface IServerHandshakePacket extends IDatabridgePacket<"HANDSHAKE", {clientId: string}> {}

export interface IPingPacket extends IDatabridgePacket<"PING", {time: number, clientId?: string}> {}
export interface IDisconnectPacket extends IDatabridgePacket<"DISCONNECT", {}> {}


export interface IDatabridgeTransferMethod {
    sendPacket(packet: IDatabridgePacket<any, any>): void;
    connect(autoReconnect: boolean, maxConnectionTries: number);
    /**
     * @param {boolean} forceClose Closes the connection without sending a close packet
     */
    disconnect(forceClose: boolean): void;
    addPacketHandler(type: string, handler: (packet: IDatabridgePacket<string, any>, transfer: IDatabridgeTransferMethod) => void): void;

    get isConnected(): boolean;
}
