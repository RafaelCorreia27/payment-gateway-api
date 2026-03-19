#!/usr/bin/env bash
# Atalho na raiz do repositório → script real em backend/
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/backend/test-api.sh" "$@"
