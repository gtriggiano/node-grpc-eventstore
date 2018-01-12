#! /bin/bash

source "${BASH_SOURCE%/*}/common.sh"

echo -n "Preparing for package unit tests... "
cleanService &> /dev/null
echo "Done"

if [[ -n $1 ]]; then
  CMD="CODE_FOLDER=src mocha --require babel-register -b -w tests/unit/index"
else
  CMD="CODE_FOLDER=lib mocha lib-tests/unit/index"
fi

runAsService development $CMD

echo -n "Cleaning after package unit tests... "
cleanService &> /dev/null
echo "Done"
