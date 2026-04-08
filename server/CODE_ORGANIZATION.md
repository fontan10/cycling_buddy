# Server Code Organization

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB via Mongoose

## Directory Structure

```
server/
├── src/
│   ├── index.ts       # Entry point — middleware, route mounting, DB connection
│   ├── models/        # One file per Mongoose model
│   └── routes/        # One file per resource group
├── package.json
└── tsconfig.json
```

## Conventions

- **Models**: Each model has its own file in `src/models/`. Files are named after the model they export (e.g. `ReportComment.ts` exports `ReportComment`).
- **Routes**: Each route file handles one resource group and is mounted in `index.ts`. Route files import only the models they need.
- **Soft deletes**: Deletable documents use `isDeleted: Boolean` + `deletedAt: Date`. Queries always filter on `isDeleted: false`.
- **Cached counts**: Denormalized count fields (e.g. `likeCount`, `commentCount`) on a document are kept in sync by the route handler that mutates the related collection.

## Scripts

```bash
npm run dev    # Start dev server with hot reload
npm run build  # Compile TypeScript to dist/
npm run start  # Run compiled output
```
