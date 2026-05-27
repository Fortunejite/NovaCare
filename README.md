# NovaCare

NovaCare is a monorepo with a TypeScript backend and a shared package for DTOs and validation schemas. The `frontend/` folder is currently a placeholder and is not part of the runnable setup yet.

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
```

`CLIENT_URL` should point to the frontend origin you plan to use in development or production.

## Development

From the repository root, run the database setup and start the backend:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

If you want to type-check without emitting output, run:

```bash
npm run lint
```

## Production

Build the workspace from the root:

```bash
npm run build
```

Apply database migrations in production:

```bash
npm run db:deploy
```

Start the compiled backend:

```bash
npm run start
```

The production backend reads compiled files from `backend/dist/` and expects the environment variables above to be available.

## Workspace Scripts

Root scripts:

- `build` builds `shared` first, then `backend`
- `build:shared` builds the shared package only
- `build:backend` builds the backend only
- `lint` type-checks `shared` and `backend`
- `lint:shared` type-checks the shared package only
- `lint:backend` type-checks the backend only
- `dev` starts the backend development server
- `start` starts the compiled backend
- `db:generate` runs Prisma client generation
- `db:migrate` runs `prisma migrate dev`
- `db:deploy` runs `prisma migrate deploy`
- `db:reset` runs `prisma migrate reset`
- `db:studio` opens Prisma Studio

Backend package scripts include the same Prisma commands plus its local build, lint, and runtime commands.