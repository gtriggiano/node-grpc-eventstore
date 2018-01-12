#! /bin/bash

source "${BASH_SOURCE%/*}/common.sh"

echo -n "Preparing for InMemoryDB adapter tests... "
cleanService development &> /dev/null
echo "Done"

if [[ "$1" == "live" ]]; then
  CMD="CODE_FOLDER=src mocha --require babel-register -b -w tests/InMemoryAdapter/index"
else
  CMD="CODE_FOLDER=lib mocha lib-tests/InMemoryAdapter/index"
fi

runAsService development $CMD

echo -n "Cleaning after InMemoryDB adapter tests... "
cleanService development &> /dev/null
echo "Done"
