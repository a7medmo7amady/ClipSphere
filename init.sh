#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[init]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
die()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

require_command() {
  local cmd="$1"
  local hint="${2:-}"
  if ! command_exists "$cmd"; then
    if [[ -n "$hint" ]]; then
      die "Missing required command: $cmd. $hint"
    fi
    die "Missing required command: $cmd"
  fi
}

require_container_runtime_ready() {
  if [[ "$CONTAINER_BIN" == "docker" ]]; then
    if ! docker info >/dev/null 2>&1; then
      die "Docker is installed but not running. Start Docker Desktop and retry."
    fi
    return
  fi

  if ! podman info >/dev/null 2>&1; then
    die "Podman is installed but not running. Start Podman service and retry."
  fi
}

pick_container_runtime() {
  if command_exists podman; then
    echo "podman"
    return
  fi

  if command_exists docker; then
    echo "docker"
    return
  fi

  die "Neither podman nor docker is installed."
}

CONTAINER_BIN="$(pick_container_runtime)"

MINIO_CONTAINER_NAME="${MINIO_CONTAINER_NAME:-minio}"
MINIO_BUCKET="${MINIO_BUCKET:-clipsphere}"
MINIO_DATA_DIR="${MINIO_DATA_DIR:-$HOME/minio-data}"
MINIO_API_PORT="${MINIO_API_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin123}"
MINIO_IMAGE="${MINIO_IMAGE:-minio/minio:latest}"

require_command bun "Install Bun from https://bun.sh"
require_command curl "Install curl to run service health checks"
require_container_runtime_ready

remove_existing_minio_container() {
  if [[ "$CONTAINER_BIN" == "podman" ]]; then
    if podman container exists "$MINIO_CONTAINER_NAME" 2>/dev/null; then
      warn "Removing existing ${MINIO_CONTAINER_NAME} container..."
      podman rm -f "$MINIO_CONTAINER_NAME" >/dev/null
    fi
    return
  fi

  if docker container inspect "$MINIO_CONTAINER_NAME" >/dev/null 2>&1; then
    warn "Removing existing ${MINIO_CONTAINER_NAME} container..."
    docker rm -f "$MINIO_CONTAINER_NAME" >/dev/null
  fi
}

wait_for_minio() {
  log "Waiting for MinIO to be ready..."
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:${MINIO_API_PORT}/minio/health/live" >/dev/null 2>&1; then
      log "MinIO is ready."
      return
    fi
    sleep 1
  done

  die "MinIO did not become ready in time."
}

run_containerized_mc() {
  local endpoint="$1"
  local network_arg="${2:-}"
  local script="mc alias set local ${endpoint} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} --api S3v4 >/dev/null && if mc ls local/${MINIO_BUCKET} >/dev/null 2>&1; then echo exists; else mc mb local/${MINIO_BUCKET} >/dev/null && echo created; fi"

  if [[ -n "$network_arg" ]]; then
    "$CONTAINER_BIN" run --rm "$network_arg" minio/mc:latest sh -c "$script"
    return
  fi

  "$CONTAINER_BIN" run --rm minio/mc:latest sh -c "$script"
}

ensure_bucket() {
  if command_exists mc; then
    mc alias set local "http://localhost:${MINIO_API_PORT}" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" --api S3v4 >/dev/null
    if mc ls "local/${MINIO_BUCKET}" >/dev/null 2>&1; then
      warn "Bucket '${MINIO_BUCKET}' already exists, skipping."
    else
      mc mb "local/${MINIO_BUCKET}" >/dev/null
      log "Bucket '${MINIO_BUCKET}' created."
    fi
    return
  fi

  warn "'mc' (MinIO client) not found; trying containerized MinIO client..."

  if run_containerized_mc "http://localhost:${MINIO_API_PORT}" "--network=host" >/dev/null 2>&1; then
    log "Bucket '${MINIO_BUCKET}' is ready."
    return
  fi

  if [[ "$CONTAINER_BIN" == "docker" ]]; then
    if run_containerized_mc "http://host.docker.internal:${MINIO_API_PORT}" >/dev/null 2>&1; then
      log "Bucket '${MINIO_BUCKET}' is ready."
      return
    fi
  fi

  warn "Could not verify/create bucket '${MINIO_BUCKET}'. If you already created it manually, you can ignore this."
}

log "Using container runtime: ${CONTAINER_BIN}"
log "Setting up MinIO data directory..."
mkdir -p "$MINIO_DATA_DIR"

remove_existing_minio_container

log "Starting MinIO..."
"$CONTAINER_BIN" run -d \
  --name "$MINIO_CONTAINER_NAME" \
  -p "${MINIO_API_PORT}:9000" \
  -p "${MINIO_CONSOLE_PORT}:9001" \
  -e "MINIO_ROOT_USER=${MINIO_ROOT_USER}" \
  -e "MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}" \
  -v "${MINIO_DATA_DIR}:/data" \
  "$MINIO_IMAGE" server /data --console-address ":9001" >/dev/null

wait_for_minio
ensure_bucket

log "Installing server dependencies with Bun..."
cd "$SCRIPT_DIR/server"
bun install

log "Starting server (dev)..."
bun run dev &
SERVER_PID=$!
log "Server started (PID $SERVER_PID)"

log "Installing client dependencies with Bun..."
cd "$SCRIPT_DIR/client"
bun install

log "Starting client (dev)..."
bun run dev &
CLIENT_PID=$!
log "Client started (PID $CLIENT_PID)"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ClipSphere is running!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "  Client  -> ${YELLOW}http://localhost:3000${NC}"
echo -e "  Server  -> ${YELLOW}http://localhost:5000${NC}"
echo -e "  MinIO   -> ${YELLOW}http://localhost:${MINIO_CONSOLE_PORT}${NC}  (${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD})"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Press Ctrl+C to stop the server and client."

cleanup() {
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

wait "$SERVER_PID" "$CLIENT_PID"
