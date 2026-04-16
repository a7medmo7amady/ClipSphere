#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[init]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
die()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# ─── MinIO ────────────────────────────────────────────────────────────────────

log "Setting up MinIO data directory..."
mkdir -p ~/minio-data
chmod -R 777 ~/minio-data

# Stop + remove any existing container so we can start fresh
if podman container exists minio 2>/dev/null; then
  warn "Removing existing minio container..."
  podman rm -f minio
fi

log "Starting MinIO..."
podman run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  -v ~/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"

# Wait for MinIO to be ready
log "Waiting for MinIO to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    log "MinIO is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    die "MinIO did not become ready in time."
  fi
  sleep 1
done

# Create the clipsphere bucket using the MinIO client (mc) if available,
# otherwise fall back to the S3 API via curl
if command -v mc &>/dev/null; then
  mc alias set local http://localhost:9000 minioadmin minioadmin123 --api S3v4 > /dev/null
  if mc ls local/clipsphere > /dev/null 2>&1; then
    warn "Bucket 'clipsphere' already exists, skipping."
  else
    mc mb local/clipsphere
    log "Bucket 'clipsphere' created."
  fi
else
  warn "'mc' (MinIO client) not found — creating bucket via AWS CLI / curl fallback..."
  # Use curl + AWS Signature v4 to create the bucket
  BUCKET="clipsphere"
  DATE=$(date -u +"%Y%m%dT%H%M%SZ")
  DATE_SHORT=$(date -u +"%Y%m%d")
  HOST="localhost:9000"
  REGION="us-east-1"
  SERVICE="s3"
  ACCESS_KEY="minioadmin"
  SECRET_KEY="minioadmin123"

  PAYLOAD_HASH=$(echo -n "" | sha256sum | awk '{print $1}')
  CANONICAL_REQUEST="PUT\n/${BUCKET}\n\nhost:${HOST}\nx-amz-content-sha256:${PAYLOAD_HASH}\nx-amz-date:${DATE}\n\nhost;x-amz-content-sha256;x-amz-date\n${PAYLOAD_HASH}"
  STRING_TO_SIGN="AWS4-HMAC-SHA256\n${DATE}\n${DATE_SHORT}/${REGION}/${SERVICE}/aws4_request\n$(echo -en "$CANONICAL_REQUEST" | sha256sum | awk '{print $1}')"
  SIGNING_KEY=$(echo -n "aws4_request" | openssl dgst -sha256 -mac HMAC -macopt "key:$(echo -n "${SERVICE}" | openssl dgst -sha256 -mac HMAC -macopt "key:$(echo -n "${REGION}" | openssl dgst -sha256 -mac HMAC -macopt "key:$(echo -n "${DATE_SHORT}" | openssl dgst -sha256 -mac HMAC -macopt "key:AWS4${SECRET_KEY}" -binary)" -binary)" -binary)" -binary)" | awk '{print $2}')
  SIGNATURE=$(echo -en "$STRING_TO_SIGN" | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${SIGNING_KEY}" | awk '{print $2}')
  AUTH_HEADER="AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${DATE_SHORT}/${REGION}/${SERVICE}/aws4_request,SignedHeaders=host;x-amz-content-sha256;x-amz-date,Signature=${SIGNATURE}"

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "http://${HOST}/${BUCKET}" \
    -H "Host: ${HOST}" \
    -H "x-amz-date: ${DATE}" \
    -H "x-amz-content-sha256: ${PAYLOAD_HASH}" \
    -H "Authorization: ${AUTH_HEADER}")

  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "409" ]; then
    log "Bucket 'clipsphere' ready (HTTP ${HTTP_STATUS})."
  else
    warn "Bucket creation returned HTTP ${HTTP_STATUS} — you may need to create it manually at http://localhost:9001"
  fi
fi

# ─── Server ───────────────────────────────────────────────────────────────────

log "Installing server dependencies..."
cd "$SCRIPT_DIR/server"
npm install

log "Starting server (dev)..."
npm run dev &
SERVER_PID=$!
log "Server started (PID $SERVER_PID)"

# ─── Client ───────────────────────────────────────────────────────────────────

log "Installing client dependencies..."
cd "$SCRIPT_DIR/client"
npm install

log "Starting client (dev)..."
npm run dev &
CLIENT_PID=$!
log "Client started (PID $CLIENT_PID)"

# ─── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ClipSphere is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Client  → ${YELLOW}http://localhost:3000${NC}"
echo -e "  Server  → ${YELLOW}http://localhost:5000${NC}"
echo -e "  MinIO   → ${YELLOW}http://localhost:9001${NC}  (minioadmin / minioadmin123)"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Press Ctrl+C to stop the server and client."

# Forward signals so Ctrl+C kills both background processes
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM

wait $SERVER_PID $CLIENT_PID
