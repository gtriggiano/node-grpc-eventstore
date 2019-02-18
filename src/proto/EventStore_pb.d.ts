// package: grpceventstore
// file: EventStore.proto

/* tslint:disable */

import * as jspb from "google-protobuf";

export class Empty extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Empty.AsObject;
    static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Empty;
    static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
    export type AsObject = {
    }
}

export class HeartbeatRequest extends jspb.Message { 
    getInterval(): number;
    setInterval(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HeartbeatRequest.AsObject;
    static toObject(includeInstance: boolean, msg: HeartbeatRequest): HeartbeatRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HeartbeatRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HeartbeatRequest;
    static deserializeBinaryFromReader(message: HeartbeatRequest, reader: jspb.BinaryReader): HeartbeatRequest;
}

export namespace HeartbeatRequest {
    export type AsObject = {
        interval: number,
    }
}

export class StreamType extends jspb.Message { 
    getContext(): string;
    setContext(value: string): void;

    getName(): string;
    setName(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamType.AsObject;
    static toObject(includeInstance: boolean, msg: StreamType): StreamType.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamType, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamType;
    static deserializeBinaryFromReader(message: StreamType, reader: jspb.BinaryReader): StreamType;
}

export namespace StreamType {
    export type AsObject = {
        context: string,
        name: string,
    }
}

export class Stream extends jspb.Message { 
    getId(): string;
    setId(value: string): void;


    hasType(): boolean;
    clearType(): void;
    getType(): StreamType | undefined;
    setType(value?: StreamType): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Stream.AsObject;
    static toObject(includeInstance: boolean, msg: Stream): Stream.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Stream, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Stream;
    static deserializeBinaryFromReader(message: Stream, reader: jspb.BinaryReader): Stream;
}

export namespace Stream {
    export type AsObject = {
        id: string,
        type?: StreamType.AsObject,
    }
}

export class Event extends jspb.Message { 
    getName(): string;
    setName(value: string): void;

    getPayload(): string;
    setPayload(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Event.AsObject;
    static toObject(includeInstance: boolean, msg: Event): Event.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Event, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Event;
    static deserializeBinaryFromReader(message: Event, reader: jspb.BinaryReader): Event;
}

export namespace Event {
    export type AsObject = {
        name: string,
        payload: string,
    }
}

export class StoredEvent extends jspb.Message { 
    getId(): string;
    setId(value: string): void;


    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;

    getName(): string;
    setName(value: string): void;

    getPayload(): string;
    setPayload(value: string): void;

    getStoredOn(): string;
    setStoredOn(value: string): void;

    getSequenceNumber(): number;
    setSequenceNumber(value: number): void;

    getCorrelationId(): string;
    setCorrelationId(value: string): void;

    getTransactionId(): string;
    setTransactionId(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StoredEvent.AsObject;
    static toObject(includeInstance: boolean, msg: StoredEvent): StoredEvent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StoredEvent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StoredEvent;
    static deserializeBinaryFromReader(message: StoredEvent, reader: jspb.BinaryReader): StoredEvent;
}

export namespace StoredEvent {
    export type AsObject = {
        id: string,
        stream?: Stream.AsObject,
        name: string,
        payload: string,
        storedOn: string,
        sequenceNumber: number,
        correlationId: string,
        transactionId: string,
    }
}

export class GetLastEventResult extends jspb.Message { 

    hasEvent(): boolean;
    clearEvent(): void;
    getEvent(): StoredEvent | undefined;
    setEvent(value?: StoredEvent): void;


    hasAvailabilityError(): boolean;
    clearAvailabilityError(): void;
    getAvailabilityError(): AvailabilityError | undefined;
    setAvailabilityError(value?: AvailabilityError): void;


    getResultCase(): GetLastEventResult.ResultCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetLastEventResult.AsObject;
    static toObject(includeInstance: boolean, msg: GetLastEventResult): GetLastEventResult.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetLastEventResult, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetLastEventResult;
    static deserializeBinaryFromReader(message: GetLastEventResult, reader: jspb.BinaryReader): GetLastEventResult;
}

export namespace GetLastEventResult {
    export type AsObject = {
        event?: StoredEvent.AsObject,
        availabilityError?: AvailabilityError.AsObject,
    }

    export enum ResultCase {
        RESULT_NOT_SET = 0,
    
    EVENT = 1,

    AVAILABILITY_ERROR = 2,

    }

}

export class CatchUpWithStoreRequest extends jspb.Message { 
    getFromEventId(): string;
    setFromEventId(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CatchUpWithStoreRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CatchUpWithStoreRequest): CatchUpWithStoreRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CatchUpWithStoreRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CatchUpWithStoreRequest;
    static deserializeBinaryFromReader(message: CatchUpWithStoreRequest, reader: jspb.BinaryReader): CatchUpWithStoreRequest;
}

export namespace CatchUpWithStoreRequest {
    export type AsObject = {
        fromEventId: string,
    }
}

export class ReadStoreForwardRequest extends jspb.Message { 
    getFromEventId(): string;
    setFromEventId(value: string): void;

    getLimit(): number;
    setLimit(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadStoreForwardRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ReadStoreForwardRequest): ReadStoreForwardRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadStoreForwardRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadStoreForwardRequest;
    static deserializeBinaryFromReader(message: ReadStoreForwardRequest, reader: jspb.BinaryReader): ReadStoreForwardRequest;
}

export namespace ReadStoreForwardRequest {
    export type AsObject = {
        fromEventId: string,
        limit: number,
    }
}

export class SubscribeToStreamRequest extends jspb.Message { 

    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubscribeToStreamRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SubscribeToStreamRequest): SubscribeToStreamRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubscribeToStreamRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubscribeToStreamRequest;
    static deserializeBinaryFromReader(message: SubscribeToStreamRequest, reader: jspb.BinaryReader): SubscribeToStreamRequest;
}

export namespace SubscribeToStreamRequest {
    export type AsObject = {
        stream?: Stream.AsObject,
    }
}

export class CatchUpWithStreamRequest extends jspb.Message { 

    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;

    getFromSequenceNumber(): number;
    setFromSequenceNumber(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CatchUpWithStreamRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CatchUpWithStreamRequest): CatchUpWithStreamRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CatchUpWithStreamRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CatchUpWithStreamRequest;
    static deserializeBinaryFromReader(message: CatchUpWithStreamRequest, reader: jspb.BinaryReader): CatchUpWithStreamRequest;
}

export namespace CatchUpWithStreamRequest {
    export type AsObject = {
        stream?: Stream.AsObject,
        fromSequenceNumber: number,
    }
}

export class ReadStreamForwardRequest extends jspb.Message { 

    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;

    getFromSequenceNumber(): number;
    setFromSequenceNumber(value: number): void;

    getLimit(): number;
    setLimit(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadStreamForwardRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ReadStreamForwardRequest): ReadStreamForwardRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadStreamForwardRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadStreamForwardRequest;
    static deserializeBinaryFromReader(message: ReadStreamForwardRequest, reader: jspb.BinaryReader): ReadStreamForwardRequest;
}

export namespace ReadStreamForwardRequest {
    export type AsObject = {
        stream?: Stream.AsObject,
        fromSequenceNumber: number,
        limit: number,
    }
}

export class SubscribeToStreamTypeRequest extends jspb.Message { 

    hasStreamType(): boolean;
    clearStreamType(): void;
    getStreamType(): StreamType | undefined;
    setStreamType(value?: StreamType): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubscribeToStreamTypeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SubscribeToStreamTypeRequest): SubscribeToStreamTypeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubscribeToStreamTypeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubscribeToStreamTypeRequest;
    static deserializeBinaryFromReader(message: SubscribeToStreamTypeRequest, reader: jspb.BinaryReader): SubscribeToStreamTypeRequest;
}

export namespace SubscribeToStreamTypeRequest {
    export type AsObject = {
        streamType?: StreamType.AsObject,
    }
}

export class CatchUpWithStreamTypeRequest extends jspb.Message { 

    hasStreamType(): boolean;
    clearStreamType(): void;
    getStreamType(): StreamType | undefined;
    setStreamType(value?: StreamType): void;

    getFromEventId(): string;
    setFromEventId(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CatchUpWithStreamTypeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CatchUpWithStreamTypeRequest): CatchUpWithStreamTypeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CatchUpWithStreamTypeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CatchUpWithStreamTypeRequest;
    static deserializeBinaryFromReader(message: CatchUpWithStreamTypeRequest, reader: jspb.BinaryReader): CatchUpWithStreamTypeRequest;
}

export namespace CatchUpWithStreamTypeRequest {
    export type AsObject = {
        streamType?: StreamType.AsObject,
        fromEventId: string,
    }
}

export class ReadStreamTypeForwardRequest extends jspb.Message { 

    hasStreamType(): boolean;
    clearStreamType(): void;
    getStreamType(): StreamType | undefined;
    setStreamType(value?: StreamType): void;

    getFromEventId(): string;
    setFromEventId(value: string): void;

    getLimit(): number;
    setLimit(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadStreamTypeForwardRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ReadStreamTypeForwardRequest): ReadStreamTypeForwardRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadStreamTypeForwardRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadStreamTypeForwardRequest;
    static deserializeBinaryFromReader(message: ReadStreamTypeForwardRequest, reader: jspb.BinaryReader): ReadStreamTypeForwardRequest;
}

export namespace ReadStreamTypeForwardRequest {
    export type AsObject = {
        streamType?: StreamType.AsObject,
        fromEventId: string,
        limit: number,
    }
}

export class StreamInsertion extends jspb.Message { 

    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;

    getExpectedStreamSize(): number;
    setExpectedStreamSize(value: number): void;

    clearEventsList(): void;
    getEventsList(): Array<Event>;
    setEventsList(value: Array<Event>): void;
    addEvents(value?: Event, index?: number): Event;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamInsertion.AsObject;
    static toObject(includeInstance: boolean, msg: StreamInsertion): StreamInsertion.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamInsertion, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamInsertion;
    static deserializeBinaryFromReader(message: StreamInsertion, reader: jspb.BinaryReader): StreamInsertion;
}

export namespace StreamInsertion {
    export type AsObject = {
        stream?: Stream.AsObject,
        expectedStreamSize: number,
        eventsList: Array<Event.AsObject>,
    }
}

export class AvailabilityError extends jspb.Message { 
    getName(): string;
    setName(value: string): void;

    getMessage(): string;
    setMessage(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AvailabilityError.AsObject;
    static toObject(includeInstance: boolean, msg: AvailabilityError): AvailabilityError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AvailabilityError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AvailabilityError;
    static deserializeBinaryFromReader(message: AvailabilityError, reader: jspb.BinaryReader): AvailabilityError;
}

export namespace AvailabilityError {
    export type AsObject = {
        name: string,
        message: string,
    }
}

export class JsonPathError extends jspb.Message { 
    getJsonpath(): string;
    setJsonpath(value: string): void;

    getMessage(): string;
    setMessage(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): JsonPathError.AsObject;
    static toObject(includeInstance: boolean, msg: JsonPathError): JsonPathError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: JsonPathError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): JsonPathError;
    static deserializeBinaryFromReader(message: JsonPathError, reader: jspb.BinaryReader): JsonPathError;
}

export namespace JsonPathError {
    export type AsObject = {
        jsonpath: string,
        message: string,
    }
}

export class InputValidationError extends jspb.Message { 
    clearErrorsList(): void;
    getErrorsList(): Array<JsonPathError>;
    setErrorsList(value: Array<JsonPathError>): void;
    addErrors(value?: JsonPathError, index?: number): JsonPathError;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InputValidationError.AsObject;
    static toObject(includeInstance: boolean, msg: InputValidationError): InputValidationError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InputValidationError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InputValidationError;
    static deserializeBinaryFromReader(message: InputValidationError, reader: jspb.BinaryReader): InputValidationError;
}

export namespace InputValidationError {
    export type AsObject = {
        errorsList: Array<JsonPathError.AsObject>,
    }
}

export class OverlappingInsertionsError extends jspb.Message { 
    clearIndexesList(): void;
    getIndexesList(): Array<number>;
    setIndexesList(value: Array<number>): void;
    addIndexes(value: number, index?: number): number;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): OverlappingInsertionsError.AsObject;
    static toObject(includeInstance: boolean, msg: OverlappingInsertionsError): OverlappingInsertionsError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: OverlappingInsertionsError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): OverlappingInsertionsError;
    static deserializeBinaryFromReader(message: OverlappingInsertionsError, reader: jspb.BinaryReader): OverlappingInsertionsError;
}

export namespace OverlappingInsertionsError {
    export type AsObject = {
        indexesList: Array<number>,
    }
}

export class UnwritableStreamsError extends jspb.Message { 
    clearStreamsList(): void;
    getStreamsList(): Array<Stream>;
    setStreamsList(value: Array<Stream>): void;
    addStreams(value?: Stream, index?: number): Stream;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnwritableStreamsError.AsObject;
    static toObject(includeInstance: boolean, msg: UnwritableStreamsError): UnwritableStreamsError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnwritableStreamsError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnwritableStreamsError;
    static deserializeBinaryFromReader(message: UnwritableStreamsError, reader: jspb.BinaryReader): UnwritableStreamsError;
}

export namespace UnwritableStreamsError {
    export type AsObject = {
        streamsList: Array<Stream.AsObject>,
    }
}

export class ConcurrencyIssue extends jspb.Message { 
    getType(): string;
    setType(value: string): void;


    hasStream(): boolean;
    clearStream(): void;
    getStream(): Stream | undefined;
    setStream(value?: Stream): void;

    getExpectedStreamSize(): number;
    setExpectedStreamSize(value: number): void;

    getCurrentStreamSize(): number;
    setCurrentStreamSize(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConcurrencyIssue.AsObject;
    static toObject(includeInstance: boolean, msg: ConcurrencyIssue): ConcurrencyIssue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConcurrencyIssue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConcurrencyIssue;
    static deserializeBinaryFromReader(message: ConcurrencyIssue, reader: jspb.BinaryReader): ConcurrencyIssue;
}

export namespace ConcurrencyIssue {
    export type AsObject = {
        type: string,
        stream?: Stream.AsObject,
        expectedStreamSize: number,
        currentStreamSize: number,
    }
}

export class ConcurrencyError extends jspb.Message { 
    clearConcurrencyIssuesList(): void;
    getConcurrencyIssuesList(): Array<ConcurrencyIssue>;
    setConcurrencyIssuesList(value: Array<ConcurrencyIssue>): void;
    addConcurrencyIssues(value?: ConcurrencyIssue, index?: number): ConcurrencyIssue;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConcurrencyError.AsObject;
    static toObject(includeInstance: boolean, msg: ConcurrencyError): ConcurrencyError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConcurrencyError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConcurrencyError;
    static deserializeBinaryFromReader(message: ConcurrencyError, reader: jspb.BinaryReader): ConcurrencyError;
}

export namespace ConcurrencyError {
    export type AsObject = {
        concurrencyIssuesList: Array<ConcurrencyIssue.AsObject>,
    }
}

export class AppendOperationError extends jspb.Message { 

    hasAvailabilityError(): boolean;
    clearAvailabilityError(): void;
    getAvailabilityError(): AvailabilityError | undefined;
    setAvailabilityError(value?: AvailabilityError): void;


    hasInputValidationError(): boolean;
    clearInputValidationError(): void;
    getInputValidationError(): InputValidationError | undefined;
    setInputValidationError(value?: InputValidationError): void;


    hasOverlappingInsertionsError(): boolean;
    clearOverlappingInsertionsError(): void;
    getOverlappingInsertionsError(): OverlappingInsertionsError | undefined;
    setOverlappingInsertionsError(value?: OverlappingInsertionsError): void;


    hasUnwritableStreamsError(): boolean;
    clearUnwritableStreamsError(): void;
    getUnwritableStreamsError(): UnwritableStreamsError | undefined;
    setUnwritableStreamsError(value?: UnwritableStreamsError): void;


    hasConcurrencyError(): boolean;
    clearConcurrencyError(): void;
    getConcurrencyError(): ConcurrencyError | undefined;
    setConcurrencyError(value?: ConcurrencyError): void;


    getTypeCase(): AppendOperationError.TypeCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AppendOperationError.AsObject;
    static toObject(includeInstance: boolean, msg: AppendOperationError): AppendOperationError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AppendOperationError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AppendOperationError;
    static deserializeBinaryFromReader(message: AppendOperationError, reader: jspb.BinaryReader): AppendOperationError;
}

export namespace AppendOperationError {
    export type AsObject = {
        availabilityError?: AvailabilityError.AsObject,
        inputValidationError?: InputValidationError.AsObject,
        overlappingInsertionsError?: OverlappingInsertionsError.AsObject,
        unwritableStreamsError?: UnwritableStreamsError.AsObject,
        concurrencyError?: ConcurrencyError.AsObject,
    }

    export enum TypeCase {
        TYPE_NOT_SET = 0,
    
    AVAILABILITY_ERROR = 1,

    INPUT_VALIDATION_ERROR = 2,

    OVERLAPPING_INSERTIONS_ERROR = 3,

    UNWRITABLE_STREAMS_ERROR = 4,

    CONCURRENCY_ERROR = 5,

    }

}

export class StoredEventsList extends jspb.Message { 
    clearStoredEventsList(): void;
    getStoredEventsList(): Array<StoredEvent>;
    setStoredEventsList(value: Array<StoredEvent>): void;
    addStoredEvents(value?: StoredEvent, index?: number): StoredEvent;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StoredEventsList.AsObject;
    static toObject(includeInstance: boolean, msg: StoredEventsList): StoredEventsList.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StoredEventsList, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StoredEventsList;
    static deserializeBinaryFromReader(message: StoredEventsList, reader: jspb.BinaryReader): StoredEventsList;
}

export namespace StoredEventsList {
    export type AsObject = {
        storedEventsList: Array<StoredEvent.AsObject>,
    }
}

export class AppendEventsToStreamRequest extends jspb.Message { 
    getCorrelationId(): string;
    setCorrelationId(value: string): void;


    hasInsertion(): boolean;
    clearInsertion(): void;
    getInsertion(): StreamInsertion | undefined;
    setInsertion(value?: StreamInsertion): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AppendEventsToStreamRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AppendEventsToStreamRequest): AppendEventsToStreamRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AppendEventsToStreamRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AppendEventsToStreamRequest;
    static deserializeBinaryFromReader(message: AppendEventsToStreamRequest, reader: jspb.BinaryReader): AppendEventsToStreamRequest;
}

export namespace AppendEventsToStreamRequest {
    export type AsObject = {
        correlationId: string,
        insertion?: StreamInsertion.AsObject,
    }
}

export class AppendEventsToMultipleStreamsRequest extends jspb.Message { 
    getCorrelationId(): string;
    setCorrelationId(value: string): void;

    clearInsertionsList(): void;
    getInsertionsList(): Array<StreamInsertion>;
    setInsertionsList(value: Array<StreamInsertion>): void;
    addInsertions(value?: StreamInsertion, index?: number): StreamInsertion;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AppendEventsToMultipleStreamsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AppendEventsToMultipleStreamsRequest): AppendEventsToMultipleStreamsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AppendEventsToMultipleStreamsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AppendEventsToMultipleStreamsRequest;
    static deserializeBinaryFromReader(message: AppendEventsToMultipleStreamsRequest, reader: jspb.BinaryReader): AppendEventsToMultipleStreamsRequest;
}

export namespace AppendEventsToMultipleStreamsRequest {
    export type AsObject = {
        correlationId: string,
        insertionsList: Array<StreamInsertion.AsObject>,
    }
}

export class AppendOperationResult extends jspb.Message { 

    hasSuccess(): boolean;
    clearSuccess(): void;
    getSuccess(): StoredEventsList | undefined;
    setSuccess(value?: StoredEventsList): void;


    hasError(): boolean;
    clearError(): void;
    getError(): AppendOperationError | undefined;
    setError(value?: AppendOperationError): void;


    getResultCase(): AppendOperationResult.ResultCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AppendOperationResult.AsObject;
    static toObject(includeInstance: boolean, msg: AppendOperationResult): AppendOperationResult.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AppendOperationResult, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AppendOperationResult;
    static deserializeBinaryFromReader(message: AppendOperationResult, reader: jspb.BinaryReader): AppendOperationResult;
}

export namespace AppendOperationResult {
    export type AsObject = {
        success?: StoredEventsList.AsObject,
        error?: AppendOperationError.AsObject,
    }

    export enum ResultCase {
        RESULT_NOT_SET = 0,
    
    SUCCESS = 1,

    ERROR = 2,

    }

}
