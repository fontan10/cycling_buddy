# Server Code Organization

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB via Mongoose
- **Auth**: Passport.js (Local, Google OAuth 2.0) + JWT
- **Deployment**: Vercel (serverless)

## Directory Structure

```text
server/
├── api/
│   └── index.ts          # Vercel serverless entry point — wraps the Express app
├── src/
│   ├── server.ts         # Loads env vars, connects to DB, starts the server
│   ├── index.ts          # Express app setup — middleware and route mounting
│   ├── db.ts             # MongoDB connection management
│   ├── types.ts          # Shared TypeScript type definitions
│   ├── middleware/
│   │   └── auth.ts       # requireAuth and optionalAuth JWT middleware
│   ├── models/           # One file per Mongoose model
│   │   ├── User.ts
│   │   ├── UserProfile.ts
│   │   ├── Report.ts
│   │   ├── ReportComment.ts
│   │   ├── ReportLike.ts
│   │   ├── ReportCommentLike.ts
│   │   ├── Team.ts
│   │   └── TeamMembership.ts
│   ├── routes/           # One file per resource group, mounted in index.ts
│   │   ├── auth.ts       # Register, login, Google OAuth callbacks
│   │   ├── reports.ts    # Report CRUD and interactions (like/unlike)
│   │   ├── comments.ts   # Comment CRUD and interactions (like/unlike)
│   │   ├── teams.ts      # Team management
│   │   └── user.ts       # User profile and settings
│   └── scripts/
│       └── migrateCoords.ts  # One-off migration scripts (not part of the app)
├── dist/                 # Compiled output (generated — do not edit)
├── vercel.json           # Rewrites all requests to /api for Vercel serverless
├── package.json
└── tsconfig.json
```

## Startup Flow

```text
server.ts  →  loads .env  →  connects MongoDB (db.ts)  →  starts Express (index.ts)
```

For Vercel, `api/index.ts` imports the Express app from `index.ts` directly — `server.ts` is not used in that path.

## Conventions

- **Models**: Each model has its own file in `src/models/`. Files are named after the model they export.
- **Routes**: Each route file handles one resource group and is mounted in `index.ts` under `/api/<resource>`.
- **Soft deletes**: Deletable documents use `isDeleted: Boolean` + `deletedAt: Date`. All queries filter on `isDeleted: false`.
- **Cached counts**: Denormalized count fields (e.g. `likeCount`, `commentCount`) are kept in sync by the route handler that mutates the related collection — there is no background job or trigger for this.

## Auth

Auth is stateless — no sessions. Every protected request must include a JWT in the `Authorization: Bearer <token>` header.

### Middleware

- `requireAuth` — verifies JWT and attaches `req.userId`. Returns `401` if missing or invalid.
- `optionalAuth` — attaches `req.userId` if a valid token is present, but never blocks the request.

### Route protection

| Action              | Middleware     |
|---------------------|----------------|
| Create report       | `optionalAuth` |
| Like/unlike report  | `requireAuth`  |
| Add comment         | `requireAuth`  |
| Like/unlike comment | `requireAuth`  |

### OAuth flow

After a successful Google login, the server redirects to:

```text
CLIENT_URL/auth/callback?token=<jwt>
```

The client reads the token from the query string and stores it.

### Passport strategies

Strategies are registered in `src/routes/auth.ts` and initialized in `index.ts` via `passport.initialize()`. Sessions are disabled (`session: false` everywhere).

| Strategy       | Package                   |
|----------------|---------------------------|
| Email/password | `passport-local`          |
| Google         | `passport-google-oauth20` |

## Environment Variables

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
SERVER_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Scripts

```bash
npm run dev    # Start dev server with hot reload (ts-node-dev)
npm run build  # Compile TypeScript to dist/
npm run start  # Run compiled output from dist/
```
