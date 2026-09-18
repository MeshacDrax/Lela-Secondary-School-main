# Database Schema Guide

The Prisma schema is located at:

```text
apps/api/prisma/schema.prisma
```

## Covered Domains

- Users and role-based access.
- Students, guardians, classes, streams, admissions, transfers, alumni state, medical information, and academic history.
- Staff profiles, subjects, attendance, leave, payroll, and performance notes.
- Attendance sessions with manual or QR/biometric-ready methods.
- Subjects, exams, grading scales, assignments, report-card-ready results, transcripts, rankings, and analytics-ready exam scores.
- Timetable slots with unique teacher and room constraints for conflict prevention.
- Fee structures, fee accounts, payments, receipts, expenses, and M-Pesa-ready payment providers.
- Announcements, message threads, and notification audiences.
- Library catalog, loans, returns, and fines.
- Inventory and asset tracking.
- Hostel rooms and allocations.
- Transport routes, drivers, and student allocation.
- AI insights, backup runs, and audit logs.

## Local PostgreSQL Setup

```bash
docker compose up -d postgres
npm install
cp .env.example .env
npm run prisma:generate
npm --workspace @lela/api run prisma:migrate
```

## Migration Strategy

1. Keep `schema.prisma` as the source of truth.
2. Create migrations with `npm --workspace @lela/api run prisma:migrate`.
3. Review generated SQL before applying in production.
4. Run backups before migrations that modify existing tables.
5. Seed reference data for roles, grading scales, classes, streams, subjects, rooms, and fee structures.

## Indexing Priorities

- `User.email`
- `Student.admissionNumber`
- `Student.studentId`
- `Student.classId`
- `Student.status`
- `StudentAttendance.studentId`
- `ExamResult.studentId`
- `AuditLog.module`
- `AuditLog.createdAt`
