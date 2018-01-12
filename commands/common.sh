#!/bin/bash

PKG_NAME=grp-ceventstore
DEFAULT_SERVICE=development

startService () {
  local SERVICE=$1
  local SERVICE=${SERVICE:=$DEFAULT_SERVICE}
  local LIVE=$2

  if [[ -n $LIVE ]]; then
    shift
    shift
    local CMD=$@
    if [[ -n $CMD ]]; then
      docker-compose -p $PKG_NAME run $SERVICE bash -c "$CMD"
    else
      docker-compose -p $PKG_NAME up $SERVICE
    fi
  else
    echo -n "Starting background service '$SERVICE'... "
    docker-compose -p $PKG_NAME up -d $SERVICE &>/dev/null
    echo "Done"
    echo "Attaching to $SERVICE logs..."
    docker-compose -p $PKG_NAME logs -f $SERVICE
  fi
}

stopService () {
  local SERVICE=$1
  local SERVICE=${SERVICE:=$DEFAULT_SERVICE}
  echo
  echo -n "Stopping all '$SERVICE' containers... "
  docker-compose -p $PKG_NAME stop $SERVICE &>/dev/null
  echo 'Done.'
  echo
}

removeService () {
  local SERVICE=$1
  local SERVICE=${SERVICE:=$DEFAULT_SERVICE}

  stopService $SERVICE
  echo
  echo -n "Removing $SERVICE container... "
  docker-compose -p $PKG_NAME rm -f $SERVICE &>/dev/null
  echo "Done."
  echo
}

cleanService () {
  local SERVICE=$1
  local SERVICE=${SERVICE:=$DEFAULT_SERVICE}

  echo
  echo -n "Stopping and removing all '$SERVICE' containers... "
  stopService $SERVICE &>/dev/null
  removeService $SERVICE &>/dev/null
  echo 'Done.'
  echo
}

runAsService () {
  local SERVICE=$1
  local SERVICE=${SERVICE:=$DEFAULT_SERVICE}
  shift
  local CMD=$@
  if [[ -n "$CMD"  ]]; then
    startService $SERVICE live $CMD
  fi
}
