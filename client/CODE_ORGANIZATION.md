# Client Code Organization

## Folder Structure

```
client/
├── public/              Static assets served at the root URL
├── src/
│   ├── assets/          Images and SVGs imported by components
│   ├── components/      Reusable UI components
│   ├── data/            Static app data (categories, constants)
│   ├── pages/           Full-screen page compositions
│   ├── types/           Shared TypeScript interfaces and union types
│   ├── index.css        Global design tokens and CSS reset
│   ├── App.tsx          Root component — renders the active page
│   └── main.tsx         Vite entry point — mounts the app into the DOM
└── index.html           HTML shell — loads fonts and the module bundle
```

---

## Conventions

### Component folders

Each component under `src/components/` gets its own folder containing a single `index.tsx` and a co-located CSS file. Using `index.tsx` keeps import paths clean.

### Page folders

Pages under `src/pages/` follow the same folder convention. A page is responsible for composing components into a full layout and owning any shared UI state. Pages use React Router hooks (`useNavigate`, `useParams`) directly — navigation is not threaded through props.

### CSS architecture

Styles are split into three layers:

| Layer | Location | Purpose |
| --- | --- | --- |
| **Tokens** | `src/index.css` | CSS custom properties — colors, spacing, radius, shadows, fonts |
| **Component** | `components/*/ComponentName.css` | Styles for a single component, using token variables |
| **Page** | `pages/*/PageName.css` | Layout-level styles scoped to a specific page |

No component imports another component's CSS. All visual values reference the token layer so the design stays consistent.

### Data vs. types

- **`src/types/`** — TypeScript interfaces and union types shared across the codebase
- **`src/data/`** — Plain data arrays and constants; editing these files is enough to change app content without touching component logic

### `src/App.tsx`

Owns routing. Declares a `BrowserRouter` and an `AnimatedRoutes` component that pairs React Router's `Routes` with framer-motion's `AnimatePresence` for page transition animations. Adding a new route means adding a `<Route>` entry here.

### Routing & transitions

Routes are declared in `App.tsx`. Each route element is wrapped in `PageTransition` (`src/components/PageTransition/`), which handles the enter and exit slide animation. Direction is encoded in React Router's location state (`{ state: { back: true } }`) so the transition slides the correct way when navigating backwards.
