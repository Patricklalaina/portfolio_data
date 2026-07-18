#!/usr/bin/env bash
# Launch the full stack (portfolio + admin + backend) via Docker Compose.
# Usage:
#   ./run.sh           — build images and start all services
#   ./run.sh --no-build — skip rebuild (use cached images)
#   ./run.sh <service> — start a single service (portfolio | admin | backend)

set -euo pipefail

if [[ "${1:-}" == "--no-build" ]]; then
  shift
  docker compose up "$@"
else
  docker compose up --build "$@"
fi
