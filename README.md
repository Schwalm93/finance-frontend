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
- production: `http://MacBookPro/api`

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

## Docker Compose Integration
From repository root, compose builds and serves the frontend through Nginx as the `frontend` service.
