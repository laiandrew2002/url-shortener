# URL Shortener

A Bitly-style URL shortener for a full-stack take-home assignment.

This repository is a npm workspaces monorepo with a Next.js frontend (`apps/web`), an Express API (`apps/api`), and PostgreSQL.

## Prerequisites

- Node.js 22.12 or later (for host-based development and tests)
- npm 10 or later
- Docker and Docker Compose

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

Inside Compose, the API reaches PostgreSQL at hostname `db`. The browser still calls the API at `http://localhost:4000`.

```bash
docker compose down         # stop containers, keep database data
docker compose down -v      # stop containers and delete the local database volume
```

Apply migrations explicitly (also runs automatically when the API container starts):

```bash
docker compose run --rm api npx prisma migrate deploy
```

## Host-based development

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:migrate
npm run dev:api
npm run dev:web
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API health: [http://localhost:4000/health](http://localhost:4000/health)

## Tests

```bash
npm run lint
npm run typecheck
npm test
npm run test:unit
npm run test:integration
```

Unit tests do not need the database. Integration tests use a separate `url_shortener_test` database on local Postgres.

## CI

GitHub Actions runs on every push and pull request:

1. `npm ci`
2. lint
3. typecheck
4. frontend and API unit tests
5. API integration tests against a PostgreSQL service
6. production builds

The lockfile and Prisma migrations are committed. `.env` files are not.

## Environment variables

See `.env.example`. Do not point `DATABASE_URL` at `localhost` inside the API container; Compose sets `postgresql://postgres:postgres@db:5432/url_shortener`.

## Current status

Phases 1–6 are in place. Deployment will be added next.
