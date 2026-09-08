#!/bin/sh
set -eu

media_root="${MEDIA_STORAGE_ROOT:-/app/runtime-data/media}"
mkdir -p "$media_root"
chown -R node:node "$media_root"

exec gosu node "$@"
