# Deployment Guide

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

The frontend build is produced in `apps/web/dist`. The API build is produced in `apps/api/dist`.

## Docker Compose

```bash
docker compose up --build
```

Services:

- `postgres`: PostgreSQL database.
- `api`: Express API.
- `web`: Vite preview server.

## Environment Variables

Required in production:

- `NODE_ENV=production`
- `PORT`
- `WEB_ORIGIN`
- `JWT_SECRET`
- `DATABASE_URL`

Payment integration:

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORT_CODE`
- `MPESA_CALLBACK_URL`

Frontend:

- `VITE_API_BASE_URL`

## Cloud-Ready Deployment

1. Provision PostgreSQL.
2. Set all environment variables in the cloud provider.
3. Run Prisma migrations.
4. Build and deploy API.
5. Build and deploy frontend to static hosting or a Node web container.
6. Configure HTTPS, CORS, and secure cookies/session policy if switching to cookie auth.
7. Configure backups, monitoring, and log retention.

## Vercel

This repository is configured as a single Vercel project. The Vite frontend is
served from `apps/web/dist`, while `/api/*` is handled by the Express function
in `api/[...path].ts`.

1. Import the repository into Vercel with the repository root as the project root.
2. Keep the generated build settings from `vercel.json`.
3. Add `JWT_SECRET` and `WEB_ORIGIN` in the Vercel environment settings. Set
	`DATABASE_URL` when connecting the Prisma schema to PostgreSQL.
4. Leave `VITE_API_BASE_URL` empty for the same-project API, or set it to an
	externally deployed API origin.
5. Deploy. The frontend and API will share the same Vercel domain.

## Recommended Production Hardening

- Serve the frontend through a CDN.
- Put the API behind a reverse proxy with HTTPS.
- Add rate limiting on login and payment endpoints.
- Use a secret manager for JWT and payment credentials.
- Enable database backups and restore drills.
- Add queue workers for SMS, email, PDF generation, and AI scoring.
