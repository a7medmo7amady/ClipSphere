# Step 1: Database

## Schema Design (Mongoose ODM)

### User Schema

- [ ]  Define fields:
    - [ ]  username (unique, required)
    - [ ]  email (unique, required)
    - [ ]  password (hashed, required)
    - [ ]  role (`user` | `admin`, default: user)
    - [ ]  bio (optional)
    - [ ]  avatarKey (metadata only)
    - [ ]  active (boolean, default: true)
    - [ ]  accountStatus (for moderation)
    - [ ]  notificationPreferences:
        - [ ] inApp: followers, comments, likes, tips (booleans)
        - [ ]  email: followers, comments, likes, tips (booleans)
- [ ] Add unique index on email
- [ ]  Add unique index on username
### Video Schema

- [ ]  Define fields:
    - [ ] title (required)
    - [ ]  description
    - [ ]  owner (ObjectId ref → User)
    - [ ]  videoURL (key placeholder)
    - [ ]  duration (validate ≤ 300 seconds)
    - [ ]  viewsCount (default: 0)
    - [ ]  status (`public` | `private` | `flagged`)
    - [ ]  timestamps
- [ ]  Add ownership reference
- [ ]  Add validation for duration ≤ 300s

### Review Schema

- [ ] Define fields:
    - [ ]  rating (1–5, min/max validator)
    - [ ]  comment
    - [ ]  user (ObjectId ref → User)
    - [ ]  video (ObjectId ref → Video)
- [ ]  Add compound unique index (user + video)

### Followers Schema

- [ ]  Define fields:
    - [ ]  followerId (ObjectId ref → User)
    - [ ]  followingId (ObjectId ref → User)
- [ ]  Add compound unique index (followerId + followingId)
- [ ]  Add pre-save hook to prevent self-follow
---
## MongoDB Initialization

- [ ]  Setup MongoDB locally
- [ ]  Add MONGODB_URI to `.env`
- [ ]  Connect using Mongoose
- [ ]  Handle DB connection errors
- [ ]  Log successful DB connection
- [ ]  Ensure indexes are created
---
# Step 2: API Controllers

## Auth Controllers

- [ ]  register()
    - [ ] Validate input (Zod)
    - [ ]  Hash password (bcrypt, salt=10)
    - [ ]  Save user
    - [ ]  Return JWT
- [ ]  login()
    - [ ]  Validate credentials
    - [ ]  Compare password (bcrypt.compare)
    - [ ]  Generate JWT (24h expiry)
---

## User Controllers

- [ ]  getMe()
- [ ]  updateMe()
- [ ]  getUserById()
- [ ]  updatePreferences()
---
## Follow Controllers

- [ ]  followUser()
- [ ]  unfollowUser()
- [ ]  getFollowers()
- [ ]  getFollowing()
---
## Video Controllers

- [ ]  createVideo()
- [ ]  getAllPublicVideos()
- [ ]  updateVideo()
- [ ]  deleteVideo()
---
## Review Controllers

- [ ]  createReview()
---
## Admin Controllers

- [ ]  getStats() (Aggregation Pipeline)
- [ ]  updateUserStatus() (Soft delete)
- [ ] getModerationQueue()
- [ ]  adminHealthCheck()
---
## System Controllers

- [ ]  healthCheck()
---
# Step 3: API Middlewares

## Core Middlewares

- [ ]  Global Error Handler (async-safe)
- [ ] Request Logger (Morgan or Winston)
- [ ]  express.json()
---
## Security Middlewares

- [ ]  express-mongo-sanitize
- [ ]  JWT protect middleware
- [ ]  restrictTo(role)
- [ ]  Ownership middleware (compare req.user.id vs ownerId)
---
## Validation

- [ ]  Zod validation middleware for:
    - [ ]  register
    - [ ]  login
    - [ ]  updateMe
    - [ ]  video creation
    - [ ]  review submission
---
# Step 4: API Routes

## Public Routes

- [ ]  `GET /health`
- [ ]  `GET /api/v1/users/:id`
- [ ]  `GET /api/v1/videos`
- [ ]  `GET /api/v1/users/:id/followers`
- [ ]  `GET /api/v1/users/:id/following`
- [ ]  `GET /api-docs`
---
## Auth Routes

- [ ]  `POST /api/v1/auth/register`
- [ ]  `POST /api/v1/auth/login`
---
## User Protected Routes

- [ ]  `GET /api/v1/users/me`
- [ ]  `PATCH /api/v1/users/updateMe`
- [ ]  `PATCH /api/v1/users/preference`
- [ ]  `POST /api/v1/users/:id/follow`
- [ ]  `DELETE /api/v1/users/:id/unfollow`
---
## Video Protected Routes

- [ ]  `POST /api/v1/videos`
- [ ]  `PATCH /api/v1/videos/:id`
- [ ]  `DELETE /api/v1/videos/:id`
- [ ]  `POST /api/v1/videos/:id/reviews`
---
## Admin Routes (protect + restrictTo(admin))

- [ ]  `GET /api/v1/admin/health`
- [ ]  `GET /api/v1/admin/stats`
- [ ]  `PATCH /api/v1/admin/users/:id/status`
- [ ]  `GET /api/v1/admin/moderation`
---
# Step 5: API Documentation

## Swagger Integration

- [ ]  Install swagger-jsdoc
- [ ]  Install swagger-ui-express
- [ ]  Configure OpenAPI definition
- [ ]  Add JWT Bearer security scheme
- [ ]  Document:
    - [ ] Auth routes
    - [ ]  User routes
    - [ ]  Video routes
    - [ ]  Review routes
    - [ ]  Admin routes
- [ ]  Document error responses (400, 401, 403, 404)
- [ ]  Serve docs at `/api-docs`
---
