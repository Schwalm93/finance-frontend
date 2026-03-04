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
- On failed uploads or missing file selection, the modal stays open so the user can correct the issue.

## Docker Compose Integration
From repository root, compose builds and serves the frontend through Nginx as the `frontend` service.
- Nach `make docker`, `make new` oder `make new-no-cache` ist das Frontend unter `http://localhost` erreichbar.
- Falls dein lokales Netzwerk/Hosts-Setup den Alias auflöst, funktioniert zusätzlich `http://finance`.
