## ClipSphere Server

Node.js/Express backend following a simple three-layer architecture:
**Routes (entry point) → Controllers (orchestration) → Services (business logic)**.

### Environment variables

Create a `.env` file in the `server` directory based on `.env.example`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clipsphere
JWT_SECRET=your_secure_secret_here
```

### Scripts

- **Development**: `npm run dev`
- **Production**: `npm start`

### Features implemented

- **Three-layer architecture**: `routes`, `controllers`, `services`.
- **Local env control**: `.env` loaded via `dotenv` in `src/config/env.js`.
- **Global error handling**: centralized middleware in `src/middleware/errorHandler.js`.
- **Request logging**: `morgan` middleware in `src/middleware/logger.js`.
- **Security middleware**: `express-mongo-sanitize` wired via `src/middleware/security.js`.
- **Secure identity management**: register/login with bcrypt hashing, JWT auth, Zod input validation, and protected profile endpoints.

