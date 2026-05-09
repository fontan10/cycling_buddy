# Client Code Organization

## Tech Stack

| Concern | Technology |
| --- | --- |
| UI | React 19 + TypeScript |
| Routing | React Router DOM v7 |
| Animations | Framer Motion |
| Maps | Leaflet + React Leaflet |
| Build | Vite |
| State | React Context API + component-level `useState` |
| Auth | JWT (localStorage) + Google OAuth |

---

## Folder Structure

```
client/
├── public/              Static assets served at the root URL
├── src/
│   ├── assets/          Images and SVGs imported by components
│   ├── components/      Reusable UI pieces (see below)
│   ├── context/         React Context providers (auth state)
│   ├── data/            Static data arrays — edit here to change app content
│   ├── hooks/           Custom React hooks for shared logic
│   ├── lib/             Utilities: API client, image compression helpers
│   ├── pages/           Full-page route components (see below)
│   ├── types/           Shared TypeScript interfaces and union types
│   ├── index.css        Global design tokens and CSS reset
│   ├── App.tsx          Root component — BrowserRouter + AnimatedRoutes + AuthProvider
│   └── main.tsx         Vite entry point — mounts the app into the DOM
└── index.html           HTML shell — loads fonts and the module bundle
```

---

## Key Directories

### `src/components/`

Reusable UI building blocks shared across pages. Each component lives in its own folder with an `index.tsx` and a co-located CSS file. Adding a new reusable piece of UI means creating a new folder here.

### `src/pages/`

One folder per route. Pages are responsible for composing components into a full layout and owning page-level state. They use React Router hooks (`useNavigate`, `useParams`) directly — navigation is not threaded through props.

Current routes include: landing/map/rankings (tab-based), report submission, report details, auth, profile, team, and a post-submission success screen.

### `src/context/`

React Context providers. Currently contains `AuthContext`, which manages the logged-in user, JWT storage in `localStorage`, login/logout, and Google OAuth callbacks. Wrap any component that needs auth state with `useAuth()`.

### `src/hooks/`

Custom hooks that encapsulate reusable logic with side-effects — things like debounced fetches or multi-step async flows that would clutter a component.

### `src/lib/`

Pure utility modules:

- **`api.ts`** — `apiFetch()` wrapper that automatically attaches the Bearer token and reads the base URL from `VITE_API_URL`. Use this for all API calls instead of raw `fetch`.
- **`imageCompression.ts`** — browser-side image compression before upload.

### `src/data/`

Plain data arrays and constants (categories, map defaults, etc.). Editing these files is enough to change app content without touching component logic.

### `src/types/`

Shared TypeScript interfaces (`Report`, `Category`, `Subcategory`, `Team`, `TeamMember`, `Tab`, etc.). Import from here rather than re-declaring types in individual files.

---

## Conventions

### CSS architecture

Styles are split into three layers:

| Layer | Location | Purpose |
| --- | --- | --- |
| **Tokens** | `src/index.css` | CSS custom properties — colors, spacing, radius, shadows, fonts |
| **Component** | `components/*/ComponentName.css` | Styles scoped to a single component |
| **Page** | `pages/*/PageName.css` | Layout-level styles scoped to a specific page |

No component imports another component's CSS. All visual values reference token variables.

### Routing & transitions

Routes are declared in `App.tsx`. Each route element is wrapped in `PageTransition` (`src/components/PageTransition/`), which uses Framer Motion's `AnimatePresence` for slide animations. Slide direction is encoded in React Router's location state (`{ state: { back: true } }`) so backwards navigation animates correctly.

To add a new route: add a `<Route>` entry in `App.tsx` and create a corresponding page folder under `src/pages/`.

### Authentication

Auth state lives in `AuthContext`. The `apiFetch()` helper in `src/lib/api.ts` reads the token automatically — page/component code should never manually attach auth headers. Protected pages should call `useAuth()` and redirect to `/auth` if no user is present.

### API calls

Always go through `apiFetch()`. It handles base URL resolution, Bearer token injection, and basic error parsing. Avoid raw `fetch` calls in components or pages.
