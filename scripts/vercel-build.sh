#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Running database migration..."
pnpm --filter @workspace/db run migrate

echo "==> Building portfolio (base = /)..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/portfolio run build

echo "==> Building admin (base = /admin/)..."
PORT=3000 BASE_PATH=/admin/ pnpm --filter @workspace/admin run build

echo "==> Building API server (server + serverless bundles)..."
pnpm --filter @workspace/api-server run build

echo "==> Assembling static output in public/..."
mkdir -p public/admin
cp -r frontend/portfolio/dist/public/. public/
cp -r frontend/admin/dist/public/. public/admin/

echo "==> Build complete."
