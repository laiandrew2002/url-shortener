# URL Shortener

A Bitly-style URL shortener: paste a long HTTP(S) URL, get a short link, copy it, and follow the short link to a 302 redirect.

npm workspaces monorepo:

| Package | Stack | Role |
| --- | --- | --- |
| `apps/web` | Next.js App Router, React, Tailwind | Form UI; calls the API |
| `apps/api` | Express, TypeScript, Prisma | Create mappings; redirect by short code |
| PostgreSQL 16 | Docker locally; Render in production | Persist `urls` rows |

## Prerequisites

- Node.js 22.12 or later
- npm 10 or later
- Docker and Docker Compose (Postgres locally, or the full stack)

## Start locally (recommended)

Run Postgres in Docker. Run the API and frontend on your machine so file saves hot-reload. You do **not** rebuild Docker images when you change application code.

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment defaults:

   ```bash
   cp .env.example .env
   ```

   Host development uses `DATABASE_URL` with hostname `localhost`. Compose’s API service overrides this to hostname `db` inside the Docker network.

3. Start PostgreSQL:

   ```bash
   npm run db:up
   ```

   Equivalent: `docker compose up -d db`.

4. Apply migrations (first time, and whenever `apps/api/prisma` changes):

   ```bash
   npm run db:migrate
   ```

5. Start the API (terminal 1):

   ```bash
   npm run dev:api
   ```

   `tsx watch` reloads the API when you save files under `apps/api`.

6. Start the frontend (terminal 2):

   ```bash
   npm run dev:web
   ```

   Next.js hot-reloads UI changes.

7. Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:4000/health](http://localhost:4000/health).

Stop Postgres with `npm run db:down` (keeps the data volume). `docker compose down -v` also deletes the local database.

## Run the full stack in Docker

Use this when you want the production-like path (built images, healthchecks, `NODE_ENV=production`). Source is copied at **image build** time, so code changes require a rebuild:

```bash
cp .env.example .env
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000). The browser talks to the API at `http://localhost:4000`. The API container talks to Postgres at hostname `db`.

```bash
docker compose down         # stop containers, keep database data
docker compose down -v      # also delete the local database volume
```

The API container runs `prisma migrate deploy` on startup. To run it explicitly:

```bash
docker compose run --rm api npx prisma migrate deploy
```

A restart without `--build` does not pick up new source.

## Tests

```bash
npm run lint
npm run typecheck
npm test
npm run test:unit
npm run test:integration
```

Unit tests do not need the database. Integration tests use `url_shortener_test` on local Postgres (`DATABASE_URL_TEST` in `.env.example`). Start `db` first if you run integration tests on the host.

## Environment variables

See `.env.example`. Do not commit `.env`.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API | Postgres connection. Host: `localhost`. Compose API: `db`. |
| `DATABASE_URL_TEST` | API tests | Isolated test database |
| `PORT` | API | Listen port (default `4000`) |
| `BASE_URL` | API | Public origin used to build short URLs (no trailing slash) |
| `FRONTEND_URL` | API | CORS allowlist (no trailing slash) |
| `RATE_LIMIT_MAX` | API | Max `POST /api/urls` per IP per 15 minutes (`0` disables) |
| `NEXT_PUBLIC_API_URL` | Web | Browser-facing API origin (baked in at Next.js build time) |

## Design decisions and trade-offs

**Monorepo with npm workspaces, not a bundler like Turborepo.** One lockfile, shared `npm test` / lint scripts, little extra tooling. Trade-off: no remote cache or task graph; the repo is small enough that this is fine.

**Separate Next.js app and Express API.** The assignment asked for both. Short-link redirects live on the API origin (`BASE_URL`), so the frontend can sit on Vercel while redirects stay on Render. Trade-off: two deploys, CORS, and `NEXT_PUBLIC_API_URL` must match. A single origin (reverse proxy or Next rewrite) would hide that split.

**PostgreSQL + Prisma migrations, not SQLite or an in-memory map.** Mappings survive restarts and match a typical take-home data layer. Unique `short_code` is enforced in the database. Trade-off: Docker (or a hosted DB) is required; free Render Postgres expires after 30 days.

**Random 7-character codes (`crypto.randomBytes`), not sequential IDs or hashes of the URL.** Codes are unguessable enough for a demo, URL-safe, and do not leak how many links exist. Collisions retry up to 5 times, then fail; the unique index prevents overwrites. Trade-off: the same destination can get multiple codes; there is no “custom slug.” Hashing the URL would make links deterministic but guessable and would couple identity to the string.

**Short URL must be shorter than the original.** Matches the product rule. On `*.onrender.com` hostnames this often rejects modest URLs; a custom API domain is the real fix, not a shorter code.

**Validate `http:` / `https:` only; do not fetch the destination.** Avoids SSRF and hanging on slow sites. Trade-off: broken or malicious destinations still get a short link. `javascript:` and other schemes are rejected.

**In-memory rate limit on create (`express-rate-limit`).** Cheap abuse brake for a single process. Trade-off: counters reset on deploy/sleep and do not share across instances. Redis (or similar) would be the production version.

**CORS locked to `FRONTEND_URL`; `X-Powered-By` disabled.** Limits which browser origins can call `POST /api/urls`. Redirects themselves are not CORS-gated (navigation is not an XHR).

**No authentication.** Anyone who can hit the API can create links. Fits a public shortener and keeps the assignment small. Trade-off: spam, phishing, and no “my links” on the server.

**Host `tsx watch` / `next dev` for daily work; Compose images for parity with deploy.** Fast feedback vs. a slower but realistic production build. Next `output: "standalone"` is used for the web Docker image and skipped on Vercel (`VERCEL` is set there).

**Vercel (web) + Render (API + Postgres).** Matches “frontend on Vercel, backend elsewhere.” Trade-off: Render free web services spin down when idle (slow first request); short URLs use the API hostname, which is long until you add a custom domain.

## CI

GitHub Actions on push and pull request: `npm ci`, lint, typecheck, frontend and API unit tests, API integration tests against PostgreSQL 16, then production builds. The lockfile and Prisma migrations are committed.

## Deployment

Push `main` to GitHub first.

### 1. Render — PostgreSQL and API

1. In [Render](https://dashboard.render.com), create a Blueprint from this repo (`render.yaml`).
2. Use the **free** Postgres plan only for a short preview (30-day expiry). Prefer the **internal** `DATABASE_URL` (the Blueprint sets `connectionString`).
3. After the first API deploy, set `BASE_URL` to the public API origin with no trailing slash (for example `https://url-shortener-api.onrender.com`).
4. Set `FRONTEND_URL` after the Vercel deploy (step 2) and redeploy the API if needed.
5. Confirm `GET /health` returns `{"status":"ok"}`. The container entrypoint runs `prisma migrate deploy` on startup.

The API listens on `0.0.0.0` and Render’s `PORT`.

### 2. Vercel — frontend

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/web` (workspaces still install from the repo root).
3. Set `NEXT_PUBLIC_API_URL` to the public Render API origin (no trailing slash). Do not put database credentials on Vercel.
4. Deploy, then copy the production URL and set `FRONTEND_URL` on Render to that origin.

### 3. Verify

1. Open the Vercel URL and shorten `https://example.com/a/very/long/path`.
2. Confirm the short URL uses the API domain.
3. Open the short URL and confirm it redirects to the original destination.
4. Restart the Render API and confirm the mapping still resolves.

## Live demo

After connecting this GitHub repo to Vercel and Render:

- Frontend: _set after Vercel deploy_
- API health: _`https://<your-api>.onrender.com/health`_
- Short links use the API origin as `BASE_URL`

## Possible upgrades

- **Custom domain on the API** so short links are actually short (`https://snip.example/Ab3xYk2` instead of a long `onrender.com` host).
- **Recent links in `localStorage`** (capped list, “this device only,” clear button). Useful without auth; do not treat it as a server history or store extra data (URLs can be sensitive).
- **Click count** on each mapping, shown next to the result.
- **Optional expiry** (`expiresAt`); skip redirect after that time.
- **Shared rate limiting** (Redis) so limits survive deploys and multiple instances.
- **Single public origin** (proxy or Next rewrites) so the browser and short links share one hostname.
- **Accounts and “my links”** if the product needs a durable history across devices. That is a larger change than localStorage.
- **Warning interstitial** before redirecting to unknown hosts, if phishing is in scope.
- **Paid Postgres** (or another durable host) so demo data is not wiped when a free Render database expires.
