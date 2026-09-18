# Security Guide

## Implemented In This Scaffold

- JWT authentication.
- Role-based access control middleware.
- Helmet HTTP headers.
- CORS allowlist via `WEB_ORIGIN`.
- Password hashing with bcrypt in the demo auth service.
- Separate user roles for Admin, Principal, Teacher, Student, Parent, Accountant, and Librarian.
- Audit log data model.
- Report endpoints protected by authentication and module permissions.

## Production Checklist

- Replace the demo user store with PostgreSQL-backed users.
- Enforce strong password policy and password rotation for staff.
- Add multi-factor authentication for administrators and accountants.
- Add rate limiting for auth, exports, and payment endpoints.
- Store JWT secrets and M-Pesa credentials in a secret manager.
- Prefer short access-token lifetimes with refresh-token rotation.
- Consider httpOnly secure cookies for browser sessions.
- Add field-level authorization for parent and student portal data.
- Encrypt sensitive medical, guardian, and payment metadata at rest where required.
- Log all sensitive mutations to `AuditLog`.
- Add approval workflows for fee structure changes, payroll, and destructive data changes.
- Run dependency and container vulnerability scans in CI.
- Back up the database daily and test restores regularly.

## Data Privacy

Student records include personally identifiable information. Production deployments should define:

- Data retention rules.
- Access review cadence.
- Export approval policy.
- Parent/student consent records.
- Incident response process.
