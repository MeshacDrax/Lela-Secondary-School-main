# Lela Secondary School Management System

A modern full-stack school management platform for **Lela Secondary School**, built with React, Express, JWT authentication, role-based access control, demo data, and a PostgreSQL-ready Prisma schema.

## What Is Included

- Responsive admin dashboard with analytics, quick actions, charts, dark/light mode, and global search.
- Role-aware modules for administrators, principals, teachers, students, parents, accountants, and librarians.
- Student, staff, academic, timetable, finance, portal, communication, library, inventory, hostel, transport, audit, backup, and AI insight surfaces.
- Express REST API with JWT login, RBAC middleware, reporting exports, SSE-ready real-time notifications, and demo seed data.
- Prisma PostgreSQL schema covering users, students, staff, classes, attendance, exams, fees, payments, assets, library records, transport, hostels, audit logs, and announcements.
- API, architecture, deployment, database, and security documentation.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
API: [http://localhost:4000](http://localhost:4000)

## GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. After the code is pushed to `main`, GitHub Actions builds `apps/web` and publishes the static frontend to GitHub Pages.

Expected Pages URL:

[https://meshacdrax.github.io/Lela-Secondary-School/](https://meshacdrax.github.io/Lela-Secondary-School/)

GitHub Pages hosts the frontend only. The Express API should be deployed separately to a Node-compatible host and wired into the frontend with `VITE_API_BASE_URL`. The static site includes demo-login fallback data so the dashboard remains explorable before the API is hosted.

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@lela.sch.ke | Admin@123 |
| Principal | principal@lela.sch.ke | Principal@123 |
| Teacher | teacher@lela.sch.ke | Teacher@123 |
| Student | student@lela.sch.ke | Student@123 |
| Parent | parent@lela.sch.ke | Parent@123 |
| Accountant | accounts@lela.sch.ke | Accounts@123 |
| Librarian | librarian@lela.sch.ke | Library@123 |

## Production Notes

The API runs against in-memory demo data by default so the full interface can be explored immediately. For production, connect PostgreSQL with `DATABASE_URL`, run Prisma migrations, and replace demo data access with Prisma repositories. The schema is already included under `apps/api/prisma/schema.prisma`.

See:

- [API documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema guide](docs/DATABASE.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Security guide](docs/SECURITY.md)
