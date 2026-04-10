# Report Liking System

## Overview

Users can like and unlike reports. Likes require authentication. The like count is denormalized onto the `Report` document for efficient display, and a separate `ReportLike` collection tracks individual like records to enforce uniqueness and support per-user like status checks.

---

## Data Model

### `ReportLike` collection

Each document represents a single user liking a single report.

| Field       | Type       | Notes                        |
|-------------|------------|------------------------------|
| `reportId`  | ObjectId   | Reference to `Report`        |
| `userId`    | ObjectId   | Reference to `User`          |
| `createdAt` | Date       | Auto-set by Mongoose         |

A compound unique index on `{ reportId, userId }` prevents duplicate likes at the database level.

### `Report` document

| Field       | Type   | Notes                                            |
|-------------|--------|--------------------------------------------------|
| `likeCount` | Number | Denormalized count, updated on every like/unlike |

---

## API Endpoints

All like endpoints require a valid auth token (`requireAuth` middleware).

| Method   | Path                         | Description                              |
|----------|------------------------------|------------------------------------------|
| `GET`    | `/reports/:id/likes/me`      | Check if the current user has liked      |
| `POST`   | `/reports/:id/likes`         | Like a report                            |
| `DELETE` | `/reports/:id/likes`         | Unlike a report                          |
| `POST`   | `/reports/:id/likes/toggle`  | Toggle like (unused by client currently) |

### `GET /reports/:id/likes/me`

Returns whether the authenticated user has liked the report.

```json
{ "liked": true }
```

### `POST /reports/:id/likes`

Creates a `ReportLike` document, then recomputes and saves `likeCount` on the report.

- **201** on success: `{ "likeCount": 5 }`
- **409** if already liked: `{ "error": "Already liked" }`

### `DELETE /reports/:id/likes`

Deletes the `ReportLike` document, then recomputes and saves `likeCount` on the report.

- **200** on success: `{ "likeCount": 4 }`
- **404** if no like exists: `{ "error": "Like not found" }`

---

## Client Behavior (`ReportSheet`)

### On mount

When a `ReportSheet` opens for a report, if the user is authenticated, the component fetches `GET /reports/:id/likes/me` to initialize the `hasLiked` state. This determines whether the like button renders in its active (filled) style.

Initial `likeCount` is seeded from `report.likeCount` passed via props (already loaded with the report list).

### Toggling a like

The `toggleLike` function checks `hasLiked` and calls either `POST` or `DELETE` accordingly.

- A `liking` boolean guards against double-submission — the button is disabled while a request is in flight.
- Unauthenticated users see the button disabled with a `"Log in to like"` tooltip.
- On success, both `likeCount` and `hasLiked` local state are updated immediately (optimistic-style, but after confirmation from the server).
- The optional `onLikeChange(reportId, likeCount)` callback propagates the new count up to the parent (e.g. to update the marker or list view).

### Duplicate like handling

If the server returns `"Already liked"` (409 → `Error.message === 'Already liked'`), the client silently sets `hasLiked = true` to correct any stale state without showing an error to the user.

---

## Flow Diagram

```
User taps 👍
    │
    ├─ hasLiked = false → POST /reports/:id/likes
    │       └─ server creates ReportLike, recomputes likeCount
    │       └─ client: likeCount++, hasLiked = true, onLikeChange()
    │
    └─ hasLiked = true  → DELETE /reports/:id/likes
            └─ server deletes ReportLike, recomputes likeCount
            └─ client: likeCount--, hasLiked = false, onLikeChange()
```

---

## Key Design Decisions

- **Denormalized count** — `likeCount` on `Report` avoids a `COUNT` query every time a report is displayed. It is recomputed from the source of truth (`ReportLike.countDocuments`) on every like/unlike, so it stays accurate.
- **Unique index** — The database-level constraint on `{ reportId, userId }` is the authoritative guard against double-likes. The client-side `hasLiked` guard is a UX convenience only.
- **No optimistic update** — The UI waits for the server response before updating counts, avoiding the need to roll back on failure.
