# URL Shortener

A Bitly-style URL shortener for a full-stack take-home assignment.

This repository is a npm workspaces monorepo with a Next.js frontend (`apps/web`), an Express API (`apps/api`), and PostgreSQL.

## Live demo

Deployment is configured for **Vercel** (frontend) and **Render** (API + PostgreSQL). After you connect the GitHub repo to those accounts, add the public URLs here:

- Frontend: _set after Vercel deploy_
- API health: _`https://<your-api>.onrender.com/health`_
- Short links use the API origin as `BASE_URL`

Render’s free Postgres instances expire after 30 days (plus a 14-day grace period). They are not a permanent production database.

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

## Deployment

Push `main` to GitHub first (`git push -u origin main`).

### 1. Render — PostgreSQL and API

1. In [Render](https://dashboard.render.com), create a Blueprint from this repo (`render.yaml`).
2. Confirm the `url-shortener-db` Postgres instance uses the **free** plan if you are only previewing the assignment. It expires after 30 days.
3. Prefer the **internal** database URL for `DATABASE_URL` (the Blueprint wires `connectionString` automatically).
4. After the first API deploy, copy the public API origin (for example `https://url-shortener-api.onrender.com`) and set:
   - `BASE_URL` to that origin (no trailing slash)
   - `FRONTEND_URL` after the Vercel deploy (step 2)
5. Confirm `GET /health` returns `{"status":"ok"}`.
6. The container entrypoint runs `prisma migrate deploy` on startup.

The API listens on `0.0.0.0` and Render’s `PORT`. CORS is limited to `FRONTEND_URL`.

Free Render web services spin down after idle time, so the first request after a pause can be slow.

### 2. Vercel — frontend

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/web` (npm workspaces still install from the repo root).
3. Set `NEXT_PUBLIC_API_URL` to the public API origin from Render (no trailing slash). Do not add database credentials to Vercel.
4. Deploy, then copy the production URL (for example `https://url-shortener.vercel.app`).
5. Set `FRONTEND_URL` on the Render API to that Vercel origin and redeploy the API if needed.

### 3. Verify the public flow

1. Open the Vercel URL and shorten `https://example.com/a/very/long/path`.
2. Confirm the short URL uses the API domain.
3. Open the short URL and confirm it redirects to the original destination.
4. Restart the Render API and confirm the mapping still resolves.

## Environment variables

See `.env.example`. Do not point `DATABASE_URL` at `localhost` inside the API container; Compose sets `postgresql://postgres:postgres@db:5432/url_shortener`.

## Current status

Phases 1–7 are in place locally and in config. Public demo URLs depend on connecting this GitHub repo to Vercel and Render.
