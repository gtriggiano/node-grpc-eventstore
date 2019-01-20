// package: grpceventstore
// file: EventStore.proto

/* tslint:disable */

import * as grpc from "grpc";
import * as EventStore_pb from "./EventStore_pb";

interface IEventStoreService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    ping: IEventStoreService_IPing;
    heartbeat: IEventStoreService_IHeartbeat;
    subscribeToStore: IEventStoreService_ISubscribeToStore;
    catchUpWithStore: IEventStoreService_ICatchUpWithStore;
    readStoreForward: IEventStoreService_IReadStoreForward;
    subscribeToStream: IEventStoreService_ISubscribeToStream;
    catchUpWithStream: IEventStoreService_ICatchUpWithStream;
    readStreamForward: IEventStoreService_IReadStreamForward;
    subscribeToStreamType: IEventStoreService_ISubscribeToStreamType;
    catchUpWithStreamType: IEventStoreService_ICatchUpWithStreamType;
    readStreamTypeForward: IEventStoreService_IReadStreamTypeForward;
    appendEventsToStream: IEventStoreService_IAppendEventsToStream;
    appendEventsToMultipleStreams: IEventStoreService_IAppendEventsToMultipleStreams;
}

interface IEventStoreService_IPing extends grpc.MethodDefinition<EventStore_pb.Empty, EventStore_pb.Empty> {
    path: string; // "/grpceventstore.EventStore/Ping"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<EventStore_pb.Empty>;
    requestDeserialize: grpc.deserialize<EventStore_pb.Empty>;
    responseSerialize: grpc.serialize<EventStore_pb.Empty>;
    responseDeserialize: grpc.deserialize<EventStore_pb.Empty>;
}
interface IEventStoreService_IHeartbeat extends grpc.MethodDefinition<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty> {
    path: string; // "/grpceventstore.EventStore/Heartbeat"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.HeartbeatRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.HeartbeatRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.Empty>;
    responseDeserialize: grpc.deserialize<EventStore_pb.Empty>;
}
interface IEventStoreService_ISubscribeToStore extends grpc.MethodDefinition<EventStore_pb.Empty, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/SubscribeToStore"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.Empty>;
    requestDeserialize: grpc.deserialize<EventStore_pb.Empty>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_ICatchUpWithStore extends grpc.MethodDefinition<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/CatchUpWithStore"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.CatchUpWithStoreRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.CatchUpWithStoreRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_IReadStoreForward extends grpc.MethodDefinition<EventStore_pb.ReadStoreForwardRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/ReadStoreForward"
    requestStream: boolean; // false
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.ReadStoreForwardRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.ReadStoreForwardRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_ISubscribeToStream extends grpc.MethodDefinition<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/SubscribeToStream"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.SubscribeToStreamRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.SubscribeToStreamRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_ICatchUpWithStream extends grpc.MethodDefinition<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/CatchUpWithStream"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.CatchUpWithStreamRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.CatchUpWithStreamRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_IReadStreamForward extends grpc.MethodDefinition<EventStore_pb.ReadStreamForwardRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/ReadStreamForward"
    requestStream: boolean; // false
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.ReadStreamForwardRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.ReadStreamForwardRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_ISubscribeToStreamType extends grpc.MethodDefinition<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/SubscribeToStreamType"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.SubscribeToStreamTypeRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.SubscribeToStreamTypeRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_ICatchUpWithStreamType extends grpc.MethodDefinition<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/CatchUpWithStreamType"
    requestStream: boolean; // true
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.CatchUpWithStreamTypeRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.CatchUpWithStreamTypeRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_IReadStreamTypeForward extends grpc.MethodDefinition<EventStore_pb.ReadStreamTypeForwardRequest, EventStore_pb.StoredEvent> {
    path: string; // "/grpceventstore.EventStore/ReadStreamTypeForward"
    requestStream: boolean; // false
    responseStream: boolean; // true
    requestSerialize: grpc.serialize<EventStore_pb.ReadStreamTypeForwardRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.ReadStreamTypeForwardRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEvent>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEvent>;
}
interface IEventStoreService_IAppendEventsToStream extends grpc.MethodDefinition<EventStore_pb.AppendEventsToStreamRequest, EventStore_pb.StoredEventsList> {
    path: string; // "/grpceventstore.EventStore/AppendEventsToStream"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<EventStore_pb.AppendEventsToStreamRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.AppendEventsToStreamRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEventsList>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEventsList>;
}
interface IEventStoreService_IAppendEventsToMultipleStreams extends grpc.MethodDefinition<EventStore_pb.AppendEventsToMultipleStreamsRequest, EventStore_pb.StoredEventsList> {
    path: string; // "/grpceventstore.EventStore/AppendEventsToMultipleStreams"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<EventStore_pb.AppendEventsToMultipleStreamsRequest>;
    requestDeserialize: grpc.deserialize<EventStore_pb.AppendEventsToMultipleStreamsRequest>;
    responseSerialize: grpc.serialize<EventStore_pb.StoredEventsList>;
    responseDeserialize: grpc.deserialize<EventStore_pb.StoredEventsList>;
}

export const EventStoreService: IEventStoreService;

export interface IEventStoreServer {
    ping: grpc.handleUnaryCall<EventStore_pb.Empty, EventStore_pb.Empty>;
    heartbeat: grpc.handleBidiStreamingCall<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    subscribeToStore: grpc.handleBidiStreamingCall<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    catchUpWithStore: grpc.handleBidiStreamingCall<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    readStoreForward: grpc.handleServerStreamingCall<EventStore_pb.ReadStoreForwardRequest, EventStore_pb.StoredEvent>;
    subscribeToStream: grpc.handleBidiStreamingCall<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    catchUpWithStream: grpc.handleBidiStreamingCall<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    readStreamForward: grpc.handleServerStreamingCall<EventStore_pb.ReadStreamForwardRequest, EventStore_pb.StoredEvent>;
    subscribeToStreamType: grpc.handleBidiStreamingCall<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    catchUpWithStreamType: grpc.handleBidiStreamingCall<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    readStreamTypeForward: grpc.handleServerStreamingCall<EventStore_pb.ReadStreamTypeForwardRequest, EventStore_pb.StoredEvent>;
    appendEventsToStream: grpc.handleUnaryCall<EventStore_pb.AppendEventsToStreamRequest, EventStore_pb.StoredEventsList>;
    appendEventsToMultipleStreams: grpc.handleUnaryCall<EventStore_pb.AppendEventsToMultipleStreamsRequest, EventStore_pb.StoredEventsList>;
}

export interface IEventStoreClient {
    ping(request: EventStore_pb.Empty, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    ping(request: EventStore_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    ping(request: EventStore_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    heartbeat(): grpc.ClientDuplexStream<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    heartbeat(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    heartbeat(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    subscribeToStore(): grpc.ClientDuplexStream<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    subscribeToStore(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    subscribeToStore(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    catchUpWithStore(): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    catchUpWithStore(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    catchUpWithStore(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    readStoreForward(request: EventStore_pb.ReadStoreForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    readStoreForward(request: EventStore_pb.ReadStoreForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    subscribeToStream(): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    subscribeToStream(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    subscribeToStream(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    catchUpWithStream(): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    catchUpWithStream(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    catchUpWithStream(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    readStreamForward(request: EventStore_pb.ReadStreamForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    readStreamForward(request: EventStore_pb.ReadStreamForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    subscribeToStreamType(): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    subscribeToStreamType(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    subscribeToStreamType(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    catchUpWithStreamType(): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    catchUpWithStreamType(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    catchUpWithStreamType(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    readStreamTypeForward(request: EventStore_pb.ReadStreamTypeForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    readStreamTypeForward(request: EventStore_pb.ReadStreamTypeForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
}

export class EventStoreClient extends grpc.Client implements IEventStoreClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public ping(request: EventStore_pb.Empty, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    public ping(request: EventStore_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    public ping(request: EventStore_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.Empty) => void): grpc.ClientUnaryCall;
    public heartbeat(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    public heartbeat(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.HeartbeatRequest, EventStore_pb.Empty>;
    public subscribeToStore(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    public subscribeToStore(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.Empty, EventStore_pb.StoredEvent>;
    public catchUpWithStore(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    public catchUpWithStore(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStoreRequest, EventStore_pb.StoredEvent>;
    public readStoreForward(request: EventStore_pb.ReadStoreForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public readStoreForward(request: EventStore_pb.ReadStoreForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public subscribeToStream(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    public subscribeToStream(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamRequest, EventStore_pb.StoredEvent>;
    public catchUpWithStream(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    public catchUpWithStream(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamRequest, EventStore_pb.StoredEvent>;
    public readStreamForward(request: EventStore_pb.ReadStreamForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public readStreamForward(request: EventStore_pb.ReadStreamForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public subscribeToStreamType(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    public subscribeToStreamType(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.SubscribeToStreamTypeRequest, EventStore_pb.StoredEvent>;
    public catchUpWithStreamType(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    public catchUpWithStreamType(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<EventStore_pb.CatchUpWithStreamTypeRequest, EventStore_pb.StoredEvent>;
    public readStreamTypeForward(request: EventStore_pb.ReadStreamTypeForwardRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public readStreamTypeForward(request: EventStore_pb.ReadStreamTypeForwardRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<EventStore_pb.StoredEvent>;
    public appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    public appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    public appendEventsToStream(request: EventStore_pb.AppendEventsToStreamRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    public appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    public appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
    public appendEventsToMultipleStreams(request: EventStore_pb.AppendEventsToMultipleStreamsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EventStore_pb.StoredEventsList) => void): grpc.ClientUnaryCall;
}
