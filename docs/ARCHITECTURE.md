# Architecture

## Overview

The project is organized as an npm workspace:

- `apps/web`: React, Vite, TypeScript, responsive UI.
- `apps/api`: Express, TypeScript, JWT auth, RBAC, REST endpoints, report exports.
- `packages/shared`: shared roles, auth user, and envelope types.
- `docs`: API, database, deployment, and security documentation.

## Runtime Flow

1. A user signs in through the React app.
2. The API validates credentials and returns a JWT.
3. The frontend stores the session locally for the demo and sends `Authorization: Bearer <jwt>` on protected calls.
4. RBAC middleware checks the signed-in role against each module.
5. Module data is served from seeded demo records.
6. Reports are downloaded from API export endpoints.
7. Notifications can arrive through the SSE stream.

## Production Data Layer

The demo API uses in-memory records for fast local exploration. The production path should move reads and writes into repository services backed by Prisma:

- `StudentRepository`
- `StaffRepository`
- `AcademicRepository`
- `FinanceRepository`
- `CommunicationRepository`
- `LibraryRepository`
- `InventoryRepository`
- `AuditRepository`

The Prisma schema already maps the requested domain areas and supports PostgreSQL.

## Scalability Notes

- Keep module routes thin and move business rules into services.
- Use database indexes on search-heavy fields such as admission number, student id, class, stream, role, module, and timestamps.
- Use background workers for SMS/email, report generation, backup jobs, AI predictions, and payment reconciliation.
- Use object storage for photos, documents, receipts, generated report cards, and transcripts.
- Use WebSockets or SSE for live notifications, attendance dashboards, and payment status updates.

## Suggested Production Services

- PostgreSQL for transactional data.
- Redis for sessions, queues, throttling, and notification fanout.
- S3-compatible storage for files.
- SMTP and SMS gateway for communications.
- M-Pesa Daraja API for payments.
- Observability stack for logs, metrics, uptime, and audit trails.
