# Frontend

React + TypeScript + Vite frontend for the transaction manager application.

## Tech Stack
- React 18
- TypeScript
- Vite
- Bootstrap

## Prerequisites
- Node.js 18+
- npm

## Configuration
Environment files:
- `.env.development`
- `.env.production`

Required variable:
- `VITE_API_BASE_URL`: backend base URL used by the frontend API layer.

Current defaults:
- development: `http://localhost:8080`
- production: `/api` (same host via Traefik proxy)

## Install
From `frontend/`:

```bash
npm ci
```

## Run Development Server
From `frontend/`:

```bash
npm run dev
```

Default Vite URL: `http://localhost:5173`.

## Lint
From `frontend/`:

```bash
npm run lint
```

## Build
From `frontend/`:

```bash
npm run build
```

## Preview Production Build
From `frontend/`:

```bash
npm run preview
```

## Category Management Modal
- In `Manage Transactions`, click `Kategorien verwalten` to open the category modal.
- The modal supports:
- create category (`POST /transactions/addCategory`)
- update category (`PUT /transactions/updateCategory` with `oldCategory` and `newCategory`)
- delete category (`DELETE /transactions/deleteCategory`)
- After each change, category options are reloaded automatically in the transaction view.

## Transaction Upload Modal
- In `Manage Transactions`, click `Transaktionen hinzufügen` to open the upload modal.
- After a successful file upload, the modal closes automatically.
- After a successful file upload, a success toast is shown outside the modal so it remains visible after closing.
- On failed uploads or missing file selection, the modal stays open so the user can correct the issue.

## Login Modal
- The navigation login action opens a centered sign-in modal with a two-column layout.
- The modal includes username/password fields, a remember-me option and a password reset link.
- The current implementation is visual only; the `Einloggen` action still closes the modal until backend authentication is wired in.

## Shared Modal Design
- Login, transaction upload, category management and asset management now use the same rounded modal language with warm gradients, compact actions and responsive spacing.
- Upload and category management use the shared modal theme from `src/components/popups/ModalTheme.css`.
- Asset management keeps `react-modal`, but matches the same visual system through its local CSS classes.

## App Layout
- The frontend now uses a shared app shell with a soft gradient background, a glass-style navigation bar and centered content width.
- The original money coin logo in the navigation is kept and embedded in the updated top bar.
- Landing page, transaction overview, asset overview, user management and the error page now share the same hero/card layout system from `src/components/sites/css/SiteLayout.css`.

## Transaction Table Design
- The transaction overview table now uses a custom themed table shell instead of the default Bootstrap dark header look.
- Header, row hover, status labels and amount pills match the new blue-gold design language.
- Positive and negative amounts are rendered as colored capsules for faster scanning.

## Docker Compose Integration
From repository root, compose builds and serves the frontend through Nginx as the `frontend` service.
- Nach `make docker`, `make new` oder `make new-no-cache` ist das Frontend unter `http://localhost` erreichbar.
- Falls dein lokales Netzwerk/Hosts-Setup den Alias auflöst, funktioniert zusätzlich `http://finance`.
