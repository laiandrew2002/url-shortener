# URL Shortener

A Bitly-style URL shortener for a full-stack take-home assignment.

This repository is a npm workspaces monorepo with a Next.js frontend (`apps/web`) and an Express API (`apps/api`). Database, shortening logic, Docker, CI, and deployment will be added in later phases.

## Prerequisites

- Node.js 20.19 or later
- npm 10 or later

## Local development

```bash
npm install
cp .env.example .env
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
```

## Current status

Phase 1 (project setup) is in place: TypeScript, ESLint, and bootable application skeletons. Remaining phases are not implemented yet.
