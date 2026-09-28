#!/bin/sh
# npm runs package install scripts through this file (see npmrc). The host starts npm
# with a PATH that has no "node", which those scripts need.
PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"
export PATH
exec /bin/sh "$@"
