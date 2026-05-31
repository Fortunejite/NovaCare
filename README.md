# NovaCare

NovaCare is a monorepo with a TypeScript backend, a Next.js `frontend`, and a `shared` package for DTOs and validation schemas.

## Requirements

- Node.js 20 or newer
- npm 9 or newer
- PostgreSQL

## Install

Install dependencies from the repository root:

```bash
npm install
```

## Environment

Create a `backend/.env` file with these values:

```bash
PORT=8000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN=your-refresh-token-secret
DATABASE_URL=postgresql://user:password@localhost:5432/novacare
NODE_ENV=development

Optionally set:

- `RESEND_API_KEY` - API key for the resend email service used by the backend
- `DOMAIN` - top-level domain for cookie scoping (useful in production)
```

`CLIENT_URL` should point to the frontend origin you plan to use in development or production.

## Development

Basic workflow to develop both backend and frontend.

1. Install dependencies:

```bash
npm install
```

2. Prepare the database (run from repo root or inside `backend`):

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
```

3. Start the services in separate terminals:

Terminal A (backend):

```bash
npm run dev:backend
```

Terminal B (frontend):

```bash
npm run dev:frontend
```

Notes:
- `dev:frontend` runs `next dev` (default Next.js dev server on port 3000).
- `dev:backend` runs the backend with `ts-node-dev` and reads environment variables from `backend/.env`.

Type-check and lint:

```bash
npm run lint
npm run lint:frontend
npm run lint:backend
```

## Production

Build everything and start services in a production environment.

1. Build all packages (from repo root):

```bash
npm run build
```

2. Apply database migrations on the production database:

```bash
npm run db:deploy -w backend
```

3. Start the compiled services (ensure environment variables are set in your production environment):

```bash
npm run start:backend
npm run start:frontend
```

The production backend serves from `backend/dist/` and expects the environment variables listed above.

## Workspace Scripts

Key scripts available from the repository root (run with `npm run <script>`):

- `build` — builds `shared`, `backend`, then `frontend`.
- `build:shared` / `build:backend` / `build:frontend` — build individual packages.
- `dev:backend` / `dev:frontend` — run development servers for each package.
- `start:backend` / `start:frontend` — start compiled production servers for each package.
- `lint` / `lint:shared` / `lint:backend` / `lint:frontend` — run type-check / lint per package.
- `db:generate` / `db:migrate` / `db:deploy` / `db:reset` / `db:studio` — database and Prisma commands (proxy to `backend`).

Examples:

```bash
npm run build:shared
npm run build:backend
npm run build:frontend
npm run dev:backend
npm run dev:frontend
npm run db:migrate -w backend
```

If you want a single-command concurrent dev launcher, I can add `concurrently` as a dev dependency and create a `dev:all` script.