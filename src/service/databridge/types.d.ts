import {Socket} from "net";

export interface IDatabridgePacket<PacketType, DataType> {
    id: string;
    type: PacketType;
    data: DataType;
    metadata?: any;
}

export interface IClientHandshakePacket extends IDatabridgePacket<"HANDSHAKE", {}> {}
export interface IServerHandshakePacket extends IDatabridgePacket<"HANDSHAKE", {clientId: string}> {}

export interface IPingPacket extends IDatabridgePacket<"PING", {time: number, clientId?: string}> {}
export interface IDisconnectPacket extends IDatabridgePacket<"DISCONNECT", {}> {}

declare function DatabridgeDataParser(receivedData: Buffer): Promise<IDatabridgePacket<string, any>[]>;
declare function DatabridgeDataBuilder(packet: IDatabridgePacket<string, any>): Buffer;

export interface IDatabridgeClientTransferMethod {
    sendPacket(packet: IDatabridgePacket<string, any>): void;
    connect(autoReconnect: boolean, maxConnectionTries: number);
    /**
     * @param {boolean} forceClose Closes the connection without sending a close packet
     */
    disconnect(forceClose: boolean): void;
    addPacketHandler(type: string | "ANY", handler: (packet: IDatabridgePacket<string, any>, transfer: IDatabridgeClientTransferMethod) => void): void;

    dataParser: typeof DatabridgeDataParser;
    setDataParser(dataParser: typeof DatabridgeDataParser);
    dataBuilder: typeof DatabridgeDataBuilder;
    setDataBuilder(packet: typeof DatabridgeDataBuilder);

    get isConnected(): boolean;
}

export interface IDatabridgeServerTransferMethod {
    sendPacket(clientId: string, packet: IDatabridgePacket<string, any>): void;
    startListening(options: any): void;
    stopListening(forceClose): void;

    addPacketHandler(type: string | "ANY", handler: (packet: IDatabridgePacket<string, any>, transfer: IDatabridgeClientTransferMethod) => void): void;

    dataParser: typeof DatabridgeDataParser;
    setDataParser(dataParser: typeof DatabridgeDataParser);
    dataBuilder: typeof DatabridgeDataBuilder;
    setDataBuilder(packet: typeof DatabridgeDataBuilder);
}
