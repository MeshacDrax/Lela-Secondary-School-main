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

## Recommended Production Hardening

- Serve the frontend through a CDN.
- Put the API behind a reverse proxy with HTTPS.
- Add rate limiting on login and payment endpoints.
- Use a secret manager for JWT and payment credentials.
- Enable database backups and restore drills.
- Add queue workers for SMS, email, PDF generation, and AI scoring.
