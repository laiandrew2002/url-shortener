# URL Shortener

A Bitly-style URL shortener for a full-stack take-home assignment.

This repository is a npm workspaces monorepo with a Next.js frontend (`apps/web`) and an Express API (`apps/api`). Full Docker Compose, CI, and deployment will be added in later phases.

## Prerequisites

- Node.js 20.19 or later
- npm 10 or later
- Docker (for local PostgreSQL)

## Local development

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:migrate
```

Run the apps in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API health: [http://localhost:4000/health](http://localhost:4000/health)

```bash
npm run lint
npm run typecheck
npm test
```

Unit tests do not need the database. Integration tests use a separate `url_shortener_test` database (created automatically) on the same local Postgres instance:

```bash
npm run test:unit
npm run test:integration
```

## Database

Local PostgreSQL runs in Docker and stores data in the `url_shortener_pgdata` volume. Stopping containers does not delete that volume.

```bash
docker compose up -d db
npm run db:migrate          # prisma migrate dev (development)
npm run db:deploy           # prisma migrate deploy (already-applied / CI-style)
docker compose down         # stop containers, keep data
docker compose down -v      # stop containers and delete local database data
```

## Current status

Phases 1–4 are in place: API, database, landing page, and tests. Docker Compose for the full stack, CI, and deployment will be added next.
