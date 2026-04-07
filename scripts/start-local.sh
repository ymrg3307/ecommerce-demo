#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

if [ ! -f services/auth/.env ]; then
  cp services/auth/.env.example services/auth/.env
fi

if [ ! -f services/catalog/.env ]; then
  cp services/catalog/.env.example services/catalog/.env
fi

npm run dev
