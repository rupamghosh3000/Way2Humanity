# Way2Humanity — Production Deployment

## 1. Environments

Maintain:

- local
- staging
- production

Never use production credentials locally.

## 2. Frontend Deployment

Recommended:
- Vercel

Configure:
- production domain
- environment variables
- HTTPS
- preview deployments
- build checks

## 3. Backend Deployment

Options:
- Railway
- Render
- AWS
- similar managed infrastructure

Requirements:
- HTTPS
- health endpoint
- environment variables
- log collection
- restart policy
- worker process

## 4. Database

MongoDB Atlas:

- production cluster
- IP/network controls
- least-privilege credentials
- backups
- monitoring

## 5. Redis

Use managed Redis for:
- job queue
- rate limiting
- temporary state where appropriate

## 6. Object Storage

Configure separate buckets/prefixes:

```text
uploads/original/
uploads/processed/
proof/
reports/
```

Private evidence should require signed URLs.

## 7. Environment Variables

Required categories:

```text
DATABASE_URL
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AI_PROVIDER_KEY
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
STORAGE_BUCKET
PAYMENT_KEY_ID
PAYMENT_KEY_SECRET
PAYMENT_WEBHOOK_SECRET
REDIS_URL
EMAIL_API_KEY
MAPS_API_KEY
APP_URL
API_URL
```

Use `.env.example` as the non-secret template.

## 8. CI/CD

Pipeline:

```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Integration tests
 ↓
Build
 ↓
Security checks
 ↓
Deploy staging
 ↓
Smoke tests
 ↓
Production approval/deploy
```

## 9. Health Checks

Backend:
- `/health`
- `/ready`

Health should verify critical dependencies separately.

## 10. Monitoring

Monitor:
- error rate
- latency
- AI failure rate
- payment webhook failure
- queue backlog
- upload failures
- database health
- authentication failures

## 11. Rollback

Keep deploys reversible.

Database migrations/schema changes must have a rollback strategy where feasible.

## 12. Domain

Production should use:
- HTTPS
- secure cookies if applicable
- correct CORS
- correct webhook URL
- correct OAuth callback URL

## 13. Backups

Test restoration periodically.

A backup that has never been restored should not be treated as proven recovery capability.
