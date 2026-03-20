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
- [ ] Add unique index on email
- [ ]  Add unique index on username
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
- [ ]  Ensure indexes are created
---
# Step 2: API Controllers

## Auth Controllers

- [/]  register()
    - [ ] Validate input (Zod)
    - [ ]  Hash password (bcrypt, salt=10)
    - [x]  Save user
    - [x]  Return JWT
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