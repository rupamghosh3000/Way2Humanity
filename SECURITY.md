# Way2Humanity — Security Specification

## 1. Authentication

- Passwords hashed with Argon2 or bcrypt.
- Secure session/token handling.
- Short-lived access tokens if JWT is used.
- Refresh token rotation.
- Email verification.
- Password reset tokens are short-lived and single-use.

## 2. Authorization

Use server-side RBAC/capability checks.

Never trust:
- `role` from frontend
- `isAdmin` from frontend
- `isVerified` from frontend
- `paymentStatus` from frontend
- `missionOwnerId` from frontend

## 3. File Upload Security

- Validate MIME and file signature.
- Restrict file size.
- Generate random object keys.
- Scan files where feasible.
- Strip unsafe active content.
- Store sensitive evidence privately.
- Use signed URLs.
- Never execute uploaded files.

## 4. API Security

- Helmet/security headers.
- CORS allowlist.
- Rate limiting.
- Request size limits.
- Input validation.
- NoSQL injection prevention.
- SSRF protection where URLs are accepted.
- CSRF protection where cookie-based auth requires it.

## 5. Secrets

Store in environment variables or managed secret storage.

Never commit:
- API keys
- OAuth secrets
- database credentials
- payment secrets
- JWT signing secrets

## 6. Payments

- Verify provider signatures.
- Verify webhook event IDs.
- Make webhook processing idempotent.
- Never trust frontend payment success.
- Record raw provider IDs needed for reconciliation, without exposing secrets.

## 7. Audit

Audit:
- authentication security events
- role changes
- admin actions
- verification decisions
- mission state transitions
- payment state changes
- disputes

## 8. Privacy

Minimize collected data.

Public pages must not expose:
- private contact details
- exact residential addresses unless explicitly intended
- private evidence
- internal verification notes

## 9. Abuse Prevention

Implement:
- report throttling
- duplicate submission detection
- suspicious account monitoring
- mission spam controls
- payment abuse controls
- moderation/dispute workflows

## 10. Security Headers

Configure:
- Content-Security-Policy
- HSTS in production
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame protections as appropriate

## 11. Backups

Database backups must be automated and periodically restored in a test environment.

## 12. Incident Response

Document:

1. detection
2. containment
3. investigation
4. user impact assessment
5. remediation
6. communication
7. post-incident review

## 13. Production Rule

Security controls must exist in backend code, not only in the frontend.
