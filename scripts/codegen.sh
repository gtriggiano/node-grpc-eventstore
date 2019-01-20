#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd ${BASEDIR}/../

PROTO_PATH=./src/proto

# JavaScript code generating
grpc_tools_node_protoc \
--proto_path=${PROTO_PATH} \
--js_out=import_style=commonjs,binary:${PROTO_PATH} \
--grpc_out=${PROTO_PATH} \
--plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
src/proto/EventStore.proto

grpc_tools_node_protoc \
--proto_path=${PROTO_PATH} \
--plugin=protoc-gen-ts=`which protoc-gen-ts` \
--ts_out=${PROTO_PATH} \
src/proto/EventStore.proto