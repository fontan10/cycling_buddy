# Server Code Organization

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB via Mongoose
- **Auth**: Passport.js (Local, Google OAuth 2.0) + JWT

## Directory Structure

```text
server/
├── src/
│   ├── index.ts          # Entry point — middleware, route mounting, DB connection
│   ├── middleware/
│   │   └── auth.ts       # requireAuth and optionalAuth JWT middleware
│   ├── models/           # One file per Mongoose model
│   │   ├── User.ts
│   │   ├── Report.ts
│   │   ├── ReportComment.ts
│   │   ├── ReportLike.ts
│   │   └── ReportCommentLike.ts
│   └── routes/           # One file per resource group
│       ├── auth.ts       # Auth endpoints (register, login, OAuth callbacks)
│       ├── reports.ts
│       └── comments.ts
├── package.json
└── tsconfig.json
```

## Conventions

- **Models**: Each model has its own file in `src/models/`. Files are named after the model they export (e.g. `ReportComment.ts` exports `ReportComment`).
- **Routes**: Each route file handles one resource group and is mounted in `index.ts`. Route files import only the models they need.
- **Soft deletes**: Deletable documents use `isDeleted: Boolean` + `deletedAt: Date`. Queries always filter on `isDeleted: false`.
- **Cached counts**: Denormalized count fields (e.g. `likeCount`, `commentCount`) on a document are kept in sync by the route handler that mutates the related collection.

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

All strategies are registered in `src/routes/auth.ts` and initialized in `index.ts` via `passport.initialize()`. Sessions are disabled (`session: false` everywhere).

| Strategy       | Package                   |
|----------------|---------------------------|
| Email/password | `passport-local`          |
| Google         | `passport-google-oauth20` |

### Required environment variables

```env
JWT_SECRET=
CLIENT_URL=
SERVER_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Scripts

```bash
npm run dev    # Start dev server with hot reload
npm run build  # Compile TypeScript to dist/
npm run start  # Run compiled output
```
