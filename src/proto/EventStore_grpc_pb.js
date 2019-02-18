// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var EventStore_pb = require('./EventStore_pb.js');

function serialize_grpceventstore_AppendEventsToMultipleStreamsRequest(arg) {
  if (!(arg instanceof EventStore_pb.AppendEventsToMultipleStreamsRequest)) {
    throw new Error('Expected argument of type grpceventstore.AppendEventsToMultipleStreamsRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_AppendEventsToMultipleStreamsRequest(buffer_arg) {
  return EventStore_pb.AppendEventsToMultipleStreamsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_AppendEventsToStreamRequest(arg) {
  if (!(arg instanceof EventStore_pb.AppendEventsToStreamRequest)) {
    throw new Error('Expected argument of type grpceventstore.AppendEventsToStreamRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_AppendEventsToStreamRequest(buffer_arg) {
  return EventStore_pb.AppendEventsToStreamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_AppendOperationResult(arg) {
  if (!(arg instanceof EventStore_pb.AppendOperationResult)) {
    throw new Error('Expected argument of type grpceventstore.AppendOperationResult');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_AppendOperationResult(buffer_arg) {
  return EventStore_pb.AppendOperationResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_CatchUpWithStoreRequest(arg) {
  if (!(arg instanceof EventStore_pb.CatchUpWithStoreRequest)) {
    throw new Error('Expected argument of type grpceventstore.CatchUpWithStoreRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_CatchUpWithStoreRequest(buffer_arg) {
  return EventStore_pb.CatchUpWithStoreRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_CatchUpWithStreamRequest(arg) {
  if (!(arg instanceof EventStore_pb.CatchUpWithStreamRequest)) {
    throw new Error('Expected argument of type grpceventstore.CatchUpWithStreamRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_CatchUpWithStreamRequest(buffer_arg) {
  return EventStore_pb.CatchUpWithStreamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_CatchUpWithStreamTypeRequest(arg) {
  if (!(arg instanceof EventStore_pb.CatchUpWithStreamTypeRequest)) {
    throw new Error('Expected argument of type grpceventstore.CatchUpWithStreamTypeRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_CatchUpWithStreamTypeRequest(buffer_arg) {
  return EventStore_pb.CatchUpWithStreamTypeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_Empty(arg) {
  if (!(arg instanceof EventStore_pb.Empty)) {
    throw new Error('Expected argument of type grpceventstore.Empty');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_Empty(buffer_arg) {
  return EventStore_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_GetLastEventResult(arg) {
  if (!(arg instanceof EventStore_pb.GetLastEventResult)) {
    throw new Error('Expected argument of type grpceventstore.GetLastEventResult');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_GetLastEventResult(buffer_arg) {
  return EventStore_pb.GetLastEventResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_HeartbeatRequest(arg) {
  if (!(arg instanceof EventStore_pb.HeartbeatRequest)) {
    throw new Error('Expected argument of type grpceventstore.HeartbeatRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_HeartbeatRequest(buffer_arg) {
  return EventStore_pb.HeartbeatRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_ReadStoreForwardRequest(arg) {
  if (!(arg instanceof EventStore_pb.ReadStoreForwardRequest)) {
    throw new Error('Expected argument of type grpceventstore.ReadStoreForwardRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_ReadStoreForwardRequest(buffer_arg) {
  return EventStore_pb.ReadStoreForwardRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_ReadStreamForwardRequest(arg) {
  if (!(arg instanceof EventStore_pb.ReadStreamForwardRequest)) {
    throw new Error('Expected argument of type grpceventstore.ReadStreamForwardRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_ReadStreamForwardRequest(buffer_arg) {
  return EventStore_pb.ReadStreamForwardRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_ReadStreamTypeForwardRequest(arg) {
  if (!(arg instanceof EventStore_pb.ReadStreamTypeForwardRequest)) {
    throw new Error('Expected argument of type grpceventstore.ReadStreamTypeForwardRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_ReadStreamTypeForwardRequest(buffer_arg) {
  return EventStore_pb.ReadStreamTypeForwardRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_StoredEvent(arg) {
  if (!(arg instanceof EventStore_pb.StoredEvent)) {
    throw new Error('Expected argument of type grpceventstore.StoredEvent');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_StoredEvent(buffer_arg) {
  return EventStore_pb.StoredEvent.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_SubscribeToStreamRequest(arg) {
  if (!(arg instanceof EventStore_pb.SubscribeToStreamRequest)) {
    throw new Error('Expected argument of type grpceventstore.SubscribeToStreamRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_SubscribeToStreamRequest(buffer_arg) {
  return EventStore_pb.SubscribeToStreamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpceventstore_SubscribeToStreamTypeRequest(arg) {
  if (!(arg instanceof EventStore_pb.SubscribeToStreamTypeRequest)) {
    throw new Error('Expected argument of type grpceventstore.SubscribeToStreamTypeRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_grpceventstore_SubscribeToStreamTypeRequest(buffer_arg) {
  return EventStore_pb.SubscribeToStreamTypeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var EventStoreService = exports.EventStoreService = {
  //
  // Return an empty object
  ping: {
    path: '/grpceventstore.EventStore/Ping',
    requestStream: false,
    responseStream: false,
    requestType: EventStore_pb.Empty,
    responseType: EventStore_pb.Empty,
    requestSerialize: serialize_grpceventstore_Empty,
    requestDeserialize: deserialize_grpceventstore_Empty,
    responseSerialize: serialize_grpceventstore_Empty,
    responseDeserialize: deserialize_grpceventstore_Empty,
  },
  //
  // Returns a live stream of empty objects, emitted at intervals
  heartbeat: {
    path: '/grpceventstore.EventStore/Heartbeat',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.HeartbeatRequest,
    responseType: EventStore_pb.Empty,
    requestSerialize: serialize_grpceventstore_HeartbeatRequest,
    requestDeserialize: deserialize_grpceventstore_HeartbeatRequest,
    responseSerialize: serialize_grpceventstore_Empty,
    responseDeserialize: deserialize_grpceventstore_Empty,
  },
  //
  // Returns the last stored event
  getLastEvent: {
    path: '/grpceventstore.EventStore/GetLastEvent',
    requestStream: false,
    responseStream: false,
    requestType: EventStore_pb.Empty,
    responseType: EventStore_pb.GetLastEventResult,
    requestSerialize: serialize_grpceventstore_Empty,
    requestDeserialize: deserialize_grpceventstore_Empty,
    responseSerialize: serialize_grpceventstore_GetLastEventResult,
    responseDeserialize: deserialize_grpceventstore_GetLastEventResult,
  },
  //
  // Returns a live stream of events emitted as soon as they are stored.
  subscribeToStore: {
    path: '/grpceventstore.EventStore/SubscribeToStore',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.Empty,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_Empty,
    requestDeserialize: deserialize_grpceventstore_Empty,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns a live stream of all the events stored after a certain one.
  // The server implementation should transparently switch to live events as soon as the old ones are sent.
  catchUpWithStore: {
    path: '/grpceventstore.EventStore/CatchUpWithStore',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.CatchUpWithStoreRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_CatchUpWithStoreRequest,
    requestDeserialize: deserialize_grpceventstore_CatchUpWithStoreRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns an ending stream of events stored after a certain one, up to the moment of request.
  // Clients can specify a `limit` to receive just N events.
  readStoreForward: {
    path: '/grpceventstore.EventStore/ReadStoreForward',
    requestStream: false,
    responseStream: true,
    requestType: EventStore_pb.ReadStoreForwardRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_ReadStoreForwardRequest,
    requestDeserialize: deserialize_grpceventstore_ReadStoreForwardRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns a live stream of events belonging to the same stream, emitted as soon as they are stored.
  subscribeToStream: {
    path: '/grpceventstore.EventStore/SubscribeToStream',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.SubscribeToStreamRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_SubscribeToStreamRequest,
    requestDeserialize: deserialize_grpceventstore_SubscribeToStreamRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns a live stream of all events belonging to the same stream and having a version number > than the provided one.
  // The server implementation should transparently switch to live events as soon as the old ones are sent.
  catchUpWithStream: {
    path: '/grpceventstore.EventStore/CatchUpWithStream',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.CatchUpWithStreamRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_CatchUpWithStreamRequest,
    requestDeserialize: deserialize_grpceventstore_CatchUpWithStreamRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns an ending stream of all the events belonging to the same stream, having a version number > than the provided one and stored before the time of request.
  // Clients can specify a `limit` to receive just N events.
  readStreamForward: {
    path: '/grpceventstore.EventStore/ReadStreamForward',
    requestStream: false,
    responseStream: true,
    requestType: EventStore_pb.ReadStreamForwardRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_ReadStreamForwardRequest,
    requestDeserialize: deserialize_grpceventstore_ReadStreamForwardRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns a live stream of multiplexed events belonging to streams having the same type, emitted as soon as they are stored.
  subscribeToStreamType: {
    path: '/grpceventstore.EventStore/SubscribeToStreamType',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.SubscribeToStreamTypeRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_SubscribeToStreamTypeRequest,
    requestDeserialize: deserialize_grpceventstore_SubscribeToStreamTypeRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns a live stream of multiplexed events belonging to streams having the same type stored after a given event.
  // The server implementation should transparently switch to live events as soon as the old ones are sent.
  catchUpWithStreamType: {
    path: '/grpceventstore.EventStore/CatchUpWithStreamType',
    requestStream: true,
    responseStream: true,
    requestType: EventStore_pb.CatchUpWithStreamTypeRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_CatchUpWithStreamTypeRequest,
    requestDeserialize: deserialize_grpceventstore_CatchUpWithStreamTypeRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Returns an ending stream of multiplexed events belonging to streams having the same type, stored after a given event and before the time of request.
  // Clients can specify a `limit` to receive just N events.
  readStreamTypeForward: {
    path: '/grpceventstore.EventStore/ReadStreamTypeForward',
    requestStream: false,
    responseStream: true,
    requestType: EventStore_pb.ReadStreamTypeForwardRequest,
    responseType: EventStore_pb.StoredEvent,
    requestSerialize: serialize_grpceventstore_ReadStreamTypeForwardRequest,
    requestDeserialize: deserialize_grpceventstore_ReadStreamTypeForwardRequest,
    responseSerialize: serialize_grpceventstore_StoredEvent,
    responseDeserialize: deserialize_grpceventstore_StoredEvent,
  },
  //
  // Appends a list of events to a stream
  appendEventsToStream: {
    path: '/grpceventstore.EventStore/AppendEventsToStream',
    requestStream: false,
    responseStream: false,
    requestType: EventStore_pb.AppendEventsToStreamRequest,
    responseType: EventStore_pb.AppendOperationResult,
    requestSerialize: serialize_grpceventstore_AppendEventsToStreamRequest,
    requestDeserialize: deserialize_grpceventstore_AppendEventsToStreamRequest,
    responseSerialize: serialize_grpceventstore_AppendOperationResult,
    responseDeserialize: deserialize_grpceventstore_AppendOperationResult,
  },
  //
  // Append N lists of events to N streams
  appendEventsToMultipleStreams: {
    path: '/grpceventstore.EventStore/AppendEventsToMultipleStreams',
    requestStream: false,
    responseStream: false,
    requestType: EventStore_pb.AppendEventsToMultipleStreamsRequest,
    responseType: EventStore_pb.AppendOperationResult,
    requestSerialize: serialize_grpceventstore_AppendEventsToMultipleStreamsRequest,
    requestDeserialize: deserialize_grpceventstore_AppendEventsToMultipleStreamsRequest,
    responseSerialize: serialize_grpceventstore_AppendOperationResult,
    responseDeserialize: deserialize_grpceventstore_AppendOperationResult,
  },
};

exports.EventStoreClient = grpc.makeGenericClientConstructor(EventStoreService);
