#!/usr/bin/env bash

set -u

TOTAL=0
PASSED=0
SKIPPED=0
LAST_STATUS=""
LAST_BODY_FILE=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

load_env_file() {
	local env_file="$1"

	while IFS= read -r line || [[ -n "$line" ]]; do
		line="${line%$'\r'}"

		if [[ -z "${line//[[:space:]]/}" ]]; then
			continue
		fi

		if [[ "$line" =~ ^[[:space:]]*# ]]; then
			continue
		fi

		if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
			continue
		fi

		local key="${line%%=*}"
		local value="${line#*=}"

		key="${key//[[:space:]]/}"

		if [[ "$value" =~ ^\".*\"$ ]]; then
			value="${value:1:${#value}-2}"
		elif [[ "$value" =~ ^\'.*\'$ ]]; then
			value="${value:1:${#value}-2}"
		fi

		if [[ -z "${!key:-}" ]]; then
			export "$key=$value"
		fi
	done < "$env_file"
}

if [[ -f "${SERVER_DIR}/.env" ]]; then
	load_env_file "${SERVER_DIR}/.env"
fi

PORT="${PORT:-5000}"
BASE_URL="${API_BASE_URL:-http://localhost:${PORT}/api/v1}"

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

assert_body_contains() {
	local needle="$1"
	local label="$2"

	TOTAL=$((TOTAL + 1))

	if grep -q "$needle" "$LAST_BODY_FILE"; then
		PASSED=$((PASSED + 1))
		echo -e "${GREEN}✓${NC} ${label}"
	else
		echo -e "${RED}✗${NC} ${label}"
		echo "Response body:"
		cat "$LAST_BODY_FILE"
		echo
	fi
}

assert_json_path_present() {
	local path_expr="$1"
	local label="$2"

	TOTAL=$((TOTAL + 1))

	local value
	value="$(json_get "$LAST_BODY_FILE" "$path_expr" 2>/dev/null || true)"

	if [[ -n "$value" ]]; then
		PASSED=$((PASSED + 1))
		echo -e "${GREEN}✓${NC} ${label}"
	else
		echo -e "${RED}✗${NC} ${label}"
		echo "Response body:"
		cat "$LAST_BODY_FILE"
		echo
	fi
}

assert_json_array_length() {
	local path_expr="$1"
	local expected_length="$2"
	local label="$3"

	TOTAL=$((TOTAL + 1))

	local length
	length="$(node -e '
		const fs = require("fs");
		const filePath = process.argv[1];
		const pathExpr = process.argv[2];
		const keys = pathExpr.split(".").filter(Boolean);

		let data;
		try {
			data = JSON.parse(fs.readFileSync(filePath, "utf8"));
		} catch {
			process.exit(2);
		}

		let cursor = data;
		for (const key of keys) {
			if (cursor == null || !(key in cursor)) {
				process.exit(3);
			}
			cursor = cursor[key];
		}

		if (!Array.isArray(cursor)) {
			process.exit(4);
		}

		process.stdout.write(String(cursor.length));
	' "$LAST_BODY_FILE" "$path_expr" 2>/dev/null || true)"

	if [[ "$length" == "$expected_length" ]]; then
		PASSED=$((PASSED + 1))
		echo -e "${GREEN}✓${NC} ${label}"
	else
		echo -e "${RED}✗${NC} ${label} (expected ${expected_length}, got ${length:-<missing>})"
		echo "Response body:"
		cat "$LAST_BODY_FILE"
		echo
	fi
}

skip_check() {
	local label="$1"
	SKIPPED=$((SKIPPED + 1))
	echo -e "${YELLOW}-${NC} ${label} (skipped)"
}

promote_user_to_admin() {
	local user_id="$1"

	if [[ -z "${MONGODB_URI:-}" ]]; then
		echo -e "${RED}Fatal:${NC} MONGODB_URI is required to promote seeded user to admin"
		echo "Set MONGODB_URI in environment or in server/.env"
		exit 1
	fi

	(
		cd "$SERVER_DIR" || exit 1
		MONGODB_URI="$MONGODB_URI" node -e '
			const mongoose = require("mongoose");

			async function run() {
				const uri = process.env.MONGODB_URI;
				const userId = process.argv[1];

				await mongoose.connect(uri);
				const result = await mongoose.connection.collection("users").updateOne(
					{ _id: new mongoose.Types.ObjectId(userId) },
					{ $set: { role: "admin" } }
				);

				await mongoose.disconnect();

				if (!result.matchedCount) {
					process.exit(2);
				}
			}

			run().catch(() => process.exit(1));
		' "$user_id"
	)

	local promote_exit=$?
	if [[ "$promote_exit" -ne 0 ]]; then
		echo -e "${RED}Fatal:${NC} failed to promote user to admin"
		exit 1
	fi
}

get_user_recommendation_embedding_status() {
	local user_id="$1"

	if [[ -z "${MONGODB_URI:-}" ]]; then
		echo -e "${RED}Fatal:${NC} MONGODB_URI is required to fetch user embedding status"
		echo "Set MONGODB_URI in environment or in server/.env"
		exit 1
	fi

	(
		cd "$SERVER_DIR" || exit 1
		MONGODB_URI="$MONGODB_URI" node -e '
			const mongoose = require("mongoose");

			async function run() {
				const uri = process.env.MONGODB_URI;
				const userId = process.argv[1];

				await mongoose.connect(uri);
				const user = await mongoose.connection.collection("users").findOne(
					{ _id: new mongoose.Types.ObjectId(userId) },
					{ projection: { recommendationEmbeddingStatus: 1 } }
				);
				await mongoose.disconnect();

				if (!user) process.exit(2);
				process.stdout.write(String(user.recommendationEmbeddingStatus || ""));
			}

			run().catch(() => process.exit(1));
		' "$user_id"
	)
}

get_user_recommendation_embedding_length() {
	local user_id="$1"

	if [[ -z "${MONGODB_URI:-}" ]]; then
		echo -e "${RED}Fatal:${NC} MONGODB_URI is required to fetch user embedding length"
		echo "Set MONGODB_URI in environment or in server/.env"
		exit 1
	fi

	(
		cd "$SERVER_DIR" || exit 1
		MONGODB_URI="$MONGODB_URI" node -e '
			const mongoose = require("mongoose");

			async function run() {
				const uri = process.env.MONGODB_URI;
				const userId = process.argv[1];

				await mongoose.connect(uri);
				const user = await mongoose.connection.collection("users").findOne(
					{ _id: new mongoose.Types.ObjectId(userId) },
					{ projection: { recommendationEmbedding: 1 } }
				);
				await mongoose.disconnect();

				if (!user) process.exit(2);
				const value = user.recommendationEmbedding;
				if (!Array.isArray(value)) {
					process.stdout.write("0");
					return;
				}
				process.stdout.write(String(value.length));
			}

			run().catch(() => process.exit(1));
		' "$user_id"
	)
}

assert_equals() {
	local actual="$1"
	local expected="$2"
	local label="$3"

	TOTAL=$((TOTAL + 1))

	if [[ "$actual" == "$expected" ]]; then
		PASSED=$((PASSED + 1))
		echo -e "${GREEN}✓${NC} ${label}"
	else
		echo -e "${RED}✗${NC} ${label} (expected ${expected}, got ${actual:-<missing>})"
	fi
}

fetch_verification_code() {
	local email="$1"

	if [[ -z "${MONGODB_URI:-}" ]]; then
		echo -e "${RED}Fatal:${NC} MONGODB_URI is required to fetch verification code during seed"
		echo "Set MONGODB_URI in environment or in server/.env"
		exit 1
	fi

	(
		cd "$SERVER_DIR" || exit 1
		MONGODB_URI="$MONGODB_URI" node -e '
			const mongoose = require("mongoose");

			async function run() {
				const uri = process.env.MONGODB_URI;
				const email = process.argv[1];

				await mongoose.connect(uri);
				const user = await mongoose.connection.collection("users").findOne(
					{ email },
					{ projection: { verificationToken: 1 } }
				);

				await mongoose.disconnect();

				if (!user || !user.verificationToken) {
					process.exit(2);
				}

				process.stdout.write(String(user.verificationToken));
			}

			run().catch(() => process.exit(1));
		' "$email"
	)
}

print_header "ClipSphere API seed + edge-case test"
echo "Using BASE_URL=${BASE_URL}"
echo "(set API_BASE_URL to override)"

EXPECT_EMBEDDINGS="${EXPECT_EMBEDDINGS:-}"
EMBEDDING_VECTOR_LENGTH_EXPECTED="${VIDEO_EMBEDDING_VECTOR_LENGTH:-768}"
if [[ -z "$EXPECT_EMBEDDINGS" ]]; then
	if [[ -n "${GEMINI_API_KEY:-}" ]]; then
		EXPECT_EMBEDDINGS="true"
	else
		EXPECT_EMBEDDINGS="false"
	fi
fi
echo "EXPECT_EMBEDDINGS=${EXPECT_EMBEDDINGS}"
echo "EMBEDDING_VECTOR_LENGTH_EXPECTED=${EMBEDDING_VECTOR_LENGTH_EXPECTED}"

EXPECT_RECOMMENDATIONS="${EXPECT_RECOMMENDATIONS:-}"
if [[ -z "$EXPECT_RECOMMENDATIONS" ]]; then
	# Recommendations require MongoDB Atlas Vector Search ($vectorSearch).
	# Default to true only when embeddings are expected AND we're likely on Atlas.
	if [[ "$EXPECT_EMBEDDINGS" == "true" && "${MONGODB_URI:-}" == mongodb+srv://* ]]; then
		EXPECT_RECOMMENDATIONS="true"
	else
		EXPECT_RECOMMENDATIONS="false"
	fi
fi
echo "EXPECT_RECOMMENDATIONS=${EXPECT_RECOMMENDATIONS}"


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
ALICE_VERIFY_CODE="$(fetch_verification_code "$ALICE_EMAIL" 2>/dev/null || true)"
require_value "$ALICE_VERIFY_CODE" "Alice verification code"
api_call "POST" "/auth/verify-email" "{\"email\":\"${ALICE_EMAIL}\",\"code\":\"${ALICE_VERIFY_CODE}\"}"
assert_status "200" "Verify Alice email"



api_call "POST" "/auth/register" "{\"username\":\"${BOB_USERNAME}\",\"name\":\"Bob\",\"email\":\"${BOB_EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "201" "Register Bob"
BOB_ID="$(json_get "$LAST_BODY_FILE" "data.user.id" 2>/dev/null || true)"
require_value "$BOB_ID" "Bob id"
BOB_VERIFY_CODE="$(fetch_verification_code "$BOB_EMAIL" 2>/dev/null || true)"
require_value "$BOB_VERIFY_CODE" "Bob verification code"
api_call "POST" "/auth/verify-email" "{\"email\":\"${BOB_EMAIL}\",\"code\":\"${BOB_VERIFY_CODE}\"}"
assert_status "200" "Verify Bob email"



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

print_header "Embeddings: generation checks"
if [[ "$EXPECT_EMBEDDINGS" == "true" ]]; then
	assert_json_path_present "data.video.embeddingModel" "Video response includes embedding model"
	assert_json_path_present "data.video.embeddingUpdatedAt" "Video response includes embeddingUpdatedAt"
	assert_json_array_length "data.video.embedding" "$EMBEDDING_VECTOR_LENGTH_EXPECTED" "Video response includes embedding vector (${EMBEDDING_VECTOR_LENGTH_EXPECTED} dims)"
else
	skip_check "Embedding assertions disabled (set EXPECT_EMBEDDINGS=true with working Vertex config)"
fi

api_call "POST" "/videos" "{\"title\":\"Alice Private Video\",\"description\":\"Private test video\",\"videoURL\":\"minio/${suffix}-private.mp4\",\"duration\":60,\"status\":\"private\"}" "$ALICE_TOKEN"
assert_status "201" "Create private video"
PRIVATE_VIDEO_ID="$(json_get "$LAST_BODY_FILE" "data.video._id" 2>/dev/null || true)"
require_value "$PRIVATE_VIDEO_ID" "private video id"

api_call "POST" "/videos" "{\"title\":\"Bob Video\",\"description\":\"Video for admin delete test\",\"videoURL\":\"minio/${suffix}-bob.mp4\",\"duration\":45,\"status\":\"public\"}" "$BOB_TOKEN"
assert_status "201" "Create Bob video"
BOB_VIDEO_ID="$(json_get "$LAST_BODY_FILE" "data.video._id" 2>/dev/null || true)"
require_value "$BOB_VIDEO_ID" "Bob video id"

if [[ "$EXPECT_EMBEDDINGS" == "true" ]]; then
	assert_json_array_length "data.video.embedding" "$EMBEDDING_VECTOR_LENGTH_EXPECTED" "Bob video response includes embedding vector (${EMBEDDING_VECTOR_LENGTH_EXPECTED} dims)"
else
	skip_check "Bob embedding assertions disabled"
fi

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

print_header "Watch history + recommendations"

api_call "POST" "/watch-history" "{\"videoId\":\"${PUBLIC_VIDEO_ID}\",\"watchDuration\":12,\"completed\":false}" "$ALICE_TOKEN"
assert_status "201" "Log watch history: Alice watches her public video"

api_call "POST" "/watch-history" "{\"videoId\":\"${BOB_VIDEO_ID}\",\"watchDuration\":20,\"completed\":false}" "$ALICE_TOKEN"
assert_status "201" "Log watch history: Alice watches Bob video"

# Trending feed should still work even when the user has no stored
# recommendation embedding yet (falls back to trending aggregation).
api_call "GET" "/recommendations/feed?limit=6" "" "$ALICE_TOKEN"
assert_status "200" "Get trending videos (feed fallback before embedding recompute)"
assert_json_path_present "data.videos" "Trending feed includes videos array"
assert_json_path_present "data.videos.0.score" "Trending feed includes computed score"
assert_json_path_present "data.videos.0.avgRating" "Trending feed includes avgRating"

# Trending should also be accessible directly (public endpoint).
api_call "GET" "/recommendations/trending?limit=6"
assert_status "200" "Get trending videos (public trending endpoint)"
assert_json_path_present "data.videos" "Trending endpoint includes videos array"
assert_json_path_present "data.videos.0.score" "Trending endpoint includes computed score"
assert_json_path_present "data.videos.0.avgRating" "Trending endpoint includes avgRating"

if [[ "$EXPECT_RECOMMENDATIONS" == "true" ]]; then
	# Recompute stored user embeddings so /recommendations/feed can use them without on-demand averaging.
	(
		cd "$SERVER_DIR" || exit 1
		USER_EMBEDDINGS_RECOMPUTE_LIMIT=20 USER_EMBEDDINGS_HISTORY_LIMIT=20 npm run embeddings:users:recompute >/dev/null
	)
	assert_equals "$?" "0" "Recompute stored user recommendation embeddings"

	ALICE_RECO_STATUS="$(get_user_recommendation_embedding_status "$ALICE_ID" 2>/dev/null || true)"
	assert_equals "$ALICE_RECO_STATUS" "ready" "Alice stored recommendationEmbeddingStatus is ready"

	ALICE_RECO_LEN="$(get_user_recommendation_embedding_length "$ALICE_ID" 2>/dev/null || true)"
	assert_equals "$ALICE_RECO_LEN" "$EMBEDDING_VECTOR_LENGTH_EXPECTED" "Alice stored recommendation embedding has ${EMBEDDING_VECTOR_LENGTH_EXPECTED} dims"

	api_call "GET" "/recommendations/feed?limit=6&historyLimit=20" "" "$ALICE_TOKEN"
	assert_status "200" "Get recommendation feed (Alice)"
	assert_json_path_present "data.videos" "Recommendation feed includes videos array"

	api_call "GET" "/videos/${PUBLIC_VIDEO_ID}/recommendations?limit=6"
	assert_status "200" "Get similar videos for public video"
	assert_json_path_present "data.videos" "Similar videos response includes videos array"
else
	skip_check "Recommendation assertions disabled (set EXPECT_RECOMMENDATIONS=true on Atlas Vector Search)"
fi

api_call "PATCH" "/videos/${PUBLIC_VIDEO_ID}" "{\"title\":\"Bob tries to edit\"}" "$BOB_TOKEN"
assert_status "403" "Reject non-owner video update"

api_call "PATCH" "/videos/${PUBLIC_VIDEO_ID}" "{\"title\":\"Alice Updated Title\"}" "$ALICE_TOKEN"
assert_status "200" "Allow owner to update video"
if [[ "$EXPECT_EMBEDDINGS" == "true" ]]; then
	assert_json_path_present "data.video.embeddingUpdatedAt" "Video update refreshes embedding timestamp"
else
	skip_check "Embedding refresh assertion disabled"
fi

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

print_header "Admin: RBAC + management endpoints"

api_call "GET" "/admin/health"
assert_status "401" "Reject admin health without token"

api_call "GET" "/admin/health" "" "$BOB_TOKEN"
assert_status "403" "Reject non-admin access to admin health"

promote_user_to_admin "$ALICE_ID"

api_call "GET" "/admin/health" "" "$ALICE_TOKEN"
assert_status "200" "Allow admin health access"
assert_body_contains '"database"' "Admin health returns database diagnostics"

api_call "GET" "/admin/stats" "" "$ALICE_TOKEN"
assert_status "200" "Allow admin stats access"
assert_body_contains '"totals"' "Admin stats returns totals"

api_call "PATCH" "/admin/users/${ALICE_ID}/status" "{\"active\":false}" "$BOB_TOKEN"
assert_status "403" "Reject non-admin status update"

api_call "PATCH" "/admin/users/${BOB_ID}/status" "{}" "$ALICE_TOKEN"
assert_status "400" "Reject empty admin status payload"

api_call "PATCH" "/admin/users/${BOB_ID}/status" "{\"active\":false,\"accountStatus\":\"banned\"}" "$ALICE_TOKEN"
assert_status "200" "Admin updates user status"

api_call "GET" "/users/${BOB_ID}"
assert_status "200" "Fetch updated user after admin status change"
assert_body_contains '"active":false' "User active flag updated by admin"
assert_body_contains '"accountStatus":"banned"' "User accountStatus updated by admin"

api_call "POST" "/admin/users/${BOB_ID}/promote" "{}" "$BOB_TOKEN"
assert_status "403" "Reject non-admin attempting to promote"

api_call "POST" "/admin/users/${BOB_ID}/promote" "{}" "$ALICE_TOKEN"
assert_status "200" "Admin promotes user to admin"

api_call "GET" "/users/${BOB_ID}"
assert_status "200" "Fetch user after promotion"
assert_body_contains '"role":"admin"' "Promoted user now has admin role"

api_call "POST" "/admin/users/${BOB_ID}/promote" "{}" "$ALICE_TOKEN"
assert_status "409" "Reject promoting already-admin user"

api_call "GET" "/admin/moderation" "" "$ALICE_TOKEN"
assert_status "200" "Allow admin moderation queue access"
assert_body_contains '"flaggedVideos"' "Moderation queue includes flagged videos field"

api_call "DELETE" "/videos/${BOB_VIDEO_ID}" "" "$ALICE_TOKEN"
assert_status "200" "Admin can delete another user's video"

print_header "Cleanup test: owner delete"

api_call "DELETE" "/videos/${PUBLIC_VIDEO_ID}" "" "$ALICE_TOKEN"
assert_status "200" "Owner deletes own video"

api_call "DELETE" "/videos/${PRIVATE_VIDEO_ID}" "" "$ALICE_TOKEN"
assert_status "200" "Owner deletes private video"

echo
echo "Result: ${PASSED}/${TOTAL} checks passed (${SKIPPED} skipped)"

if [[ "$PASSED" -ne "$TOTAL" ]]; then
	exit 1
fi

echo -e "${GREEN}All seed and edge-case checks passed.${NC}"

