#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:${PORT:-5000}/api/v1}"
TOTAL=0
PASSED=0
LAST_STATUS=""
LAST_BODY_FILE=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
	if [[ -n "${LAST_BODY_FILE}" && -f "${LAST_BODY_FILE}" ]]; then
		rm -f "${LAST_BODY_FILE}"
	fi
}

trap cleanup EXIT

print_header() {
	echo -e "${YELLOW}== $1 ==${NC}"
}

json_get() {
	local file_path="$1"
	local path_expr="$2"

	node -e '
		const fs = require("fs");
		const filePath = process.argv[1];
		const pathExpr = process.argv[2];
		let data;

		try {
			data = JSON.parse(fs.readFileSync(filePath, "utf8"));
		} catch {
			process.exit(2);
		}

		const keys = pathExpr.split(".").filter(Boolean);
		let cursor = data;

		for (const key of keys) {
			if (cursor == null || !(key in cursor)) {
				process.exit(3);
			}
			cursor = cursor[key];
		}

		if (cursor === null || cursor === undefined) {
			process.exit(4);
		}

		if (typeof cursor === "object") {
			process.stdout.write(JSON.stringify(cursor));
		} else {
			process.stdout.write(String(cursor));
		}
	' "$file_path" "$path_expr"
}

api_call() {
	local method="$1"
	local endpoint="$2"
	local body="${3:-}"
	local token="${4:-}"

	if [[ -n "${LAST_BODY_FILE}" && -f "${LAST_BODY_FILE}" ]]; then
		rm -f "${LAST_BODY_FILE}"
	fi

	LAST_BODY_FILE="$(mktemp)"

	local -a curl_args
	curl_args=(
		-sS
		-o "$LAST_BODY_FILE"
		-w "%{http_code}"
		-X "$method"
		"${BASE_URL}${endpoint}"
		-H "Content-Type: application/json"
	)

	if [[ -n "$token" ]]; then
		curl_args+=( -H "Authorization: Bearer ${token}" )
	fi

	if [[ -n "$body" ]]; then
		curl_args+=( -d "$body" )
	fi

	LAST_STATUS="$(curl "${curl_args[@]}")"
}

assert_status() {
	local expected="$1"
	local label="$2"

	TOTAL=$((TOTAL + 1))

	if [[ "$LAST_STATUS" == "$expected" ]]; then
		PASSED=$((PASSED + 1))
		echo -e "${GREEN}✓${NC} ${label} (status ${LAST_STATUS})"
	else
		echo -e "${RED}✗${NC} ${label} (expected ${expected}, got ${LAST_STATUS})"
		echo "Response body:"
		cat "$LAST_BODY_FILE"
		echo
	fi
}

require_value() {
	local value="$1"
	local label="$2"

	if [[ -z "$value" ]]; then
		echo -e "${RED}Fatal:${NC} could not parse ${label} from response"
		cat "$LAST_BODY_FILE"
		echo
		exit 1
	fi
}

print_header "ClipSphere API seed + edge-case test"
echo "Using BASE_URL=${BASE_URL}"

print_header "Health check"
api_call "GET" "/health"
assert_status "200" "GET /health is reachable"

suffix="$(date +%s)"

ALICE_EMAIL="alice.${suffix}@clipsphere.dev"
BOB_EMAIL="bob.${suffix}@clipsphere.dev"
ALICE_USERNAME="alice_${suffix}"
BOB_USERNAME="bob_${suffix}"
PASSWORD="Password123!"

print_header "Auth: register + login"

api_call "POST" "/auth/register" "{\"username\":\"${ALICE_USERNAME}\",\"name\":\"Alice\",\"email\":\"${ALICE_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "201" "Register Alice"
ALICE_ID="$(json_get "$LAST_BODY_FILE" "data.user.id" 2>/dev/null || true)"
require_value "$ALICE_ID" "Alice id"

api_call "POST" "/auth/register" "{\"username\":\"${BOB_USERNAME}\",\"name\":\"Bob\",\"email\":\"${BOB_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "201" "Register Bob"
BOB_ID="$(json_get "$LAST_BODY_FILE" "data.user.id" 2>/dev/null || true)"
require_value "$BOB_ID" "Bob id"

api_call "POST" "/auth/register" "{\"username\":\"dup_${suffix}\",\"name\":\"Dup\",\"email\":\"${ALICE_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "409" "Reject duplicate email"

api_call "POST" "/auth/login" "{\"email\":\"${ALICE_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "200" "Login Alice"
ALICE_TOKEN="$(json_get "$LAST_BODY_FILE" "token" 2>/dev/null || true)"
require_value "$ALICE_TOKEN" "Alice token"

api_call "POST" "/auth/login" "{\"email\":\"${BOB_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "200" "Login Bob"
BOB_TOKEN="$(json_get "$LAST_BODY_FILE" "token" 2>/dev/null || true)"
require_value "$BOB_TOKEN" "Bob token"

print_header "Users: protected + edge cases"

api_call "GET" "/users/me"
assert_status "401" "Reject /users/me without token"

api_call "PATCH" "/users/updateMe" "{\"invalidField\":\"x\"}" "$ALICE_TOKEN"
assert_status "400" "Reject unknown field on updateMe"

api_call "POST" "/users/${BOB_ID}/follow" "" "$ALICE_TOKEN"
assert_status "200" "Alice follows Bob"

api_call "POST" "/users/${ALICE_ID}/follow" "" "$ALICE_TOKEN"
assert_status "400" "Reject self-follow"

api_call "DELETE" "/users/${ALICE_ID}/unfollow" "" "$BOB_TOKEN"
assert_status "404" "Reject unfollow when relation does not exist"

print_header "Videos: create/feed/ownership checks"

api_call "POST" "/videos" "{\"title\":\"Too Long Video\",\"description\":\"Should fail\",\"videoURL\":\"minio/too-long.mp4\",\"duration\":301}" "$ALICE_TOKEN"
assert_status "400" "Reject video duration > 300"

api_call "POST" "/videos" "{\"title\":\"Alice Public Video\",\"description\":\"Public test video\",\"videoURL\":\"minio/${suffix}-public.mp4\",\"duration\":120,\"status\":\"public\"}" "$ALICE_TOKEN"
assert_status "201" "Create public video"
PUBLIC_VIDEO_ID="$(json_get "$LAST_BODY_FILE" "data.video._id" 2>/dev/null || true)"
require_value "$PUBLIC_VIDEO_ID" "public video id"

api_call "POST" "/videos" "{\"title\":\"Alice Private Video\",\"description\":\"Private test video\",\"videoURL\":\"minio/${suffix}-private.mp4\",\"duration\":60,\"status\":\"private\"}" "$ALICE_TOKEN"
assert_status "201" "Create private video"
PRIVATE_VIDEO_ID="$(json_get "$LAST_BODY_FILE" "data.video._id" 2>/dev/null || true)"
require_value "$PRIVATE_VIDEO_ID" "private video id"

api_call "GET" "/videos"
assert_status "200" "Fetch public video feed"

if grep -q "$PRIVATE_VIDEO_ID" "$LAST_BODY_FILE"; then
	TOTAL=$((TOTAL + 1))
	echo -e "${RED}✗${NC} Private video hidden from feed"
	echo "Response unexpectedly contains private video id: ${PRIVATE_VIDEO_ID}"
	cat "$LAST_BODY_FILE"
	echo
else
	TOTAL=$((TOTAL + 1))
	PASSED=$((PASSED + 1))
	echo -e "${GREEN}✓${NC} Private video hidden from feed"
fi

api_call "PATCH" "/videos/${PUBLIC_VIDEO_ID}" "{\"title\":\"Bob tries to edit\"}" "$BOB_TOKEN"
assert_status "403" "Reject non-owner video update"

api_call "PATCH" "/videos/${PUBLIC_VIDEO_ID}" "{\"title\":\"Alice Updated Title\"}" "$ALICE_TOKEN"
assert_status "200" "Allow owner to update video"

api_call "DELETE" "/videos/${PUBLIC_VIDEO_ID}" "" "$BOB_TOKEN"
assert_status "403" "Reject non-owner/non-admin delete"

print_header "Reviews: unique + validation checks"

api_call "POST" "/videos/${PUBLIC_VIDEO_ID}/reviews" "{\"rating\":5,\"comment\":\"Amazing clip, clean transitions and solid pacing.\"}" "$BOB_TOKEN"
assert_status "201" "Create first review"

api_call "POST" "/videos/${PUBLIC_VIDEO_ID}/reviews" "{\"rating\":4,\"comment\":\"Second review should fail because of unique index.\"}" "$BOB_TOKEN"
assert_status "409" "Reject duplicate review by same user"

api_call "POST" "/videos/${PUBLIC_VIDEO_ID}/reviews" "{\"rating\":6,\"comment\":\"Invalid rating upper bound should fail.\"}" "$ALICE_TOKEN"
assert_status "400" "Reject review rating outside 1..5"

api_call "POST" "/videos/${PUBLIC_VIDEO_ID}/reviews" "{\"rating\":4,\"comment\":\"No token should fail for protected review route.\"}"
assert_status "401" "Reject review without token"

print_header "Cleanup test: owner delete"

api_call "DELETE" "/videos/${PUBLIC_VIDEO_ID}" "" "$ALICE_TOKEN"
assert_status "200" "Owner deletes own video"

api_call "DELETE" "/videos/${PRIVATE_VIDEO_ID}" "" "$ALICE_TOKEN"
assert_status "200" "Owner deletes private video"

echo
echo "Result: ${PASSED}/${TOTAL} checks passed"

if [[ "$PASSED" -ne "$TOTAL" ]]; then
	exit 1
fi

echo -e "${GREEN}All seed and edge-case checks passed.${NC}"

