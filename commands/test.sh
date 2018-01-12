#! /bin/bash

set -e

source "${BASH_SOURCE%/*}/inmemorydb:tests.sh"
echo
source "${BASH_SOURCE%/*}/unit:tests.sh"
