# Step 1: Database

## Schema Design (Mongoose ODM)

### User Schema

- [x]  Define fields:
    - [x]  username (unique, required)
    - [x]  email (unique, required)
    - [x]  password (hashed, required)
    - [x]  role (`user` | `admin`, default: user)
    - [x]  bio (optional)
    - [x]  avatarKey (metadata only)
    - [x]  active (boolean, default: true)
    - [x]  accountStatus (for moderation)
    - [x]  notificationPreferences:
        - [x] inApp: followers, comments, likes, tips (booleans)
        - [x]  email: followers, comments, likes, tips (booleans)
- [x] Add unique index on email
- [x]  Add unique index on username
### Video Schema

- [x]  Define fields:
    - [x] title (required)
    - [x]  description
    - [x]  owner (ObjectId ref → User)
    - [x]  videoURL (key placeholder)
    - [x]  duration (validate ≤ 300 seconds)
    - [x]  viewsCount (default: 0)
    - [x]  status (`public` | `private` | `flagged`)
    - [x]  timestamps
- [x]  Add ownership reference
- [x]  Add validation for duration ≤ 300s

### Review Schema

- [x] Define fields:
    - [x]  rating (1–5, min/max validator)
    - [x]  comment
    - [x]  user (ObjectId ref → User)
    - [x]  video (ObjectId ref → Video)
- [x]  Add compound unique index (user + video)

### Followers Schema

- [x]  Define fields:
    - [x]  followerId (ObjectId ref → User)
    - [x]  followingId (ObjectId ref → User)
- [x]  Add compound unique index (followerId + followingId)
- [x]  Add pre-save hook to prevent self-follow
---
## MongoDB Initialization

- [x]  Setup MongoDB locally
- [x]  Add MONGODB_URI to `.env`
- [x]  Connect using Mongoose
- [x]  Handle DB connection errors
- [x]  Log successful DB connection
- [x]  Ensure indexes are created --Indexes aren't made on startup because it affects performance, instead we made a script to sync indexes for CI/CD
---
# Step 2: API Controllers

## Auth Controllers

- [x]  register()
    - [x] Validate input (Zod)
    - [x]  Hash password (bcrypt, salt=10)
    - [x]  Save user
    - [x]  Return JWT
- [x]  login()
    - [x]  Validate credentials
    - [x]  Compare password (bcrypt.compare)
    - [x]  Generate JWT (24h expiry)
---

## User Controllert

- [x]  getMe()
- [x]  updateMe()
- [x]  getUserById()
- [x]  updatePreferences()
---
## Follow Controllers

- [x]  followUser()
- [x]  unfollowUser()
- [x]  getFollowers()
- [x]  getFollowing()
---
## Video Controllers

- [x]  createVideo()
- [x]  getAllPublicVideos()
- [x]  updateVideo()
- [x]  deleteVideo()
---
## Review Controllers

- [ ]  createReview()
---
## Admin Controllers

- [x]  getStats() (Aggregation Pipeline)
- [x]  updateUserStatus() (Soft delete)
- [x] getModerationQueue()
- [x]  adminHealthCheck()
---
## System Controllers

- [x]  healthCheck()
---
# Step 3: API Middlewares

## Core Middlewares

- [x]  Global Error Handler (async-safe)
- [x] Request Logger (Morgan or Winston)
- [x]  express.json()
---
## Security Middlewares

- [x]  express-mongo-sanitize
- [x]  JWT protect middleware
- [x]  restrictTo(role)
- [x]  Ownership middleware (compare req.user.id vs ownerId)
---
## Validation

- [ ]  Zod validation middleware for:
    - [x]  register
    - [x]  login
    - [x]  updateMe
    - [x]  video creation
    - [ ]  review submission
---
# Step 4: API Routes

## Public Routes

- [x]  `GET /health`
- [x]  `GET /api/v1/users/:id`
- [x]  `GET /api/v1/videos`
- [x]  `GET /api/v1/users/:id/followers`
- [x]  `GET /api/v1/users/:id/following`
- [ ]  `GET /api-docs`
---
## Auth Routes

- [x]  `POST /api/v1/auth/register`
- [x]  `POST /api/v1/auth/login`
---
## User Protected Routes

- [x]  `GET /api/v1/users/me`
- [x]  `PATCH /api/v1/users/updateMe`
- [x]  `PATCH /api/v1/users/preference`
- [x]  `POST /api/v1/users/:id/follow`
- [x]  `DELETE /api/v1/users/:id/unfollow`
---
## Video Protected Routes

- [x]  `POST /api/v1/videos`
- [x]  `PATCH /api/v1/videos/:id`
- [x]  `DELETE /api/v1/videos/:id`
- [ ]  `POST /api/v1/videos/:id/reviews`
---
## Admin Routes (protect + restrictTo(admin))

- [x]  `GET /api/v1/admin/health`
- [x]  `GET /api/v1/admin/stats`
- [x]  `PATCH /api/v1/admin/users/:id/status`
- [x]  `GET /api/v1/admin/moderation`
- [x]  `PATCH /api/v1/admin/users/:id/promote`
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
# Deliverables
- [ ]  Clean Three-Layer Architecture:
    - [ ]  Routes
    - [ ]  Controllers
    - [ ]  Services
- [ ]  `.env` configuration:
    - [ ]  PORT
    - [ ]  MONGODB_URI
    - [ ]  JWT_SECRET
- [ ]  Postman Collection:
    - [ ]  Environment variables
    - [ ]  Auto-token handling
    - [ ]  Tests per endpoint
- [ ]  GitHub repository (organized structure)
- [ ]  ER Diagram (Users ↔ Videos ↔ Reviews ↔ Followers)
- [ ]  Local testing passes:
    - [ ]  Registration
    - [ ]  Login
    - [ ]  RBAC enforcement
---