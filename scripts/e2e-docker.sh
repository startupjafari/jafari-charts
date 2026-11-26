#!/usr/bin/env sh
# Runs Playwright inside the official image so browsers, fonts and system
# libraries are identical everywhere (local machines and CI). Visual baselines
# are generated and compared here.
# Usage: scripts/e2e-docker.sh [playwright args], e.g. --project firefox
set -e
IMAGE="mcr.microsoft.com/playwright:v1.64.1-noble"
exec docker run --rm --ipc=host \
  --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI="${CI:-}" \
  -v "$(pwd)":/work -w /work "$IMAGE" \
  npx playwright test "$@"
