# Way2Humanity — API Specification

Base path:

`/api/v1`

All protected routes require authenticated access.

## 1. Auth

### POST `/auth/register`

Create account.

Body:
```json
{
  "name": "Rupam",
  "email": "user@example.com",
  "password": "strong-password",
  "role": "HELPER"
}
```

### POST `/auth/login`

### POST `/auth/logout`

### POST `/auth/refresh`

### POST `/auth/forgot-password`

### POST `/auth/reset-password`

### GET `/auth/me`

## 2. Users

### GET `/users/me`

### PATCH `/users/me`

### GET `/users/:id/public`

Only public-safe fields.

## 3. Missions

### POST `/missions`

Create a report.

### GET `/missions`

Public/authorized discovery with filters.

Parameters:
- category
- urgency
- status
- distance
- latitude
- longitude
- page
- limit

### GET `/missions/:publicId`

Get mission details according to viewer permissions.

### PATCH `/missions/:id`

Owner/admin update permitted fields.

### POST `/missions/:id/submit`

Submit report for verification.

### POST `/missions/:id/cancel`

Cancel according to lifecycle rules.

## 4. Evidence

### POST `/uploads/presign`

Returns signed upload information.

### POST `/missions/:id/evidence`

Create evidence metadata after upload.

### GET `/missions/:id/evidence`

Permission-controlled evidence list.

## 5. Verification

### GET `/missions/:id/verification`

Get verification status.

### POST `/verification/:missionId/review`

Verifier/admin review.

Body:
```json
{
  "decision": "APPROVE",
  "reasonCode": "EVIDENCE_SUFFICIENT",
  "notes": "Evidence reviewed."
}
```

## 6. Helper

### GET `/helper/missions`

Personalized mission suggestions.

### POST `/missions/:id/accept`

Accept mission.

### POST `/missions/:id/start`

Start work.

### POST `/missions/:id/withdraw`

Withdraw under allowed conditions.

### POST `/missions/:id/proof`

Submit proof.

## 7. Proof Review

### POST `/proof/:id/review`

Verifier/admin review.

## 8. Donations

### POST `/missions/:id/donations/order`

Create payment order.

### POST `/payments/webhook`

Provider webhook.

### GET `/donations/:id`

Get donor-visible donation status.

## 9. CSR

### POST `/csr/organizations`

Create organization request.

### POST `/csr/campaigns`

Create campaign.

### GET `/csr/campaigns/:id`

Campaign dashboard.

### GET `/csr/campaigns/:id/report`

Generate/download impact report.

## 10. Reputation

### GET `/users/me/passport`

Humanity Passport.

### GET `/users/me/reputation/events`

Points history.

## 11. Disputes

### POST `/disputes`

Open dispute.

### GET `/disputes/:id`

View permitted dispute details.

### POST `/disputes/:id/message`

Add information.

## 12. Admin

All admin routes require server-side admin authorization.

Examples:

`GET /admin/reviews`
`GET /admin/missions`
`GET /admin/users`
`POST /admin/users/:id/suspend`
`POST /admin/reviews/:id/decision`
`GET /admin/audit-events`
`GET /admin/payments`

## 13. Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "requestId": "..."
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "MISSION_NOT_FOUND",
    "message": "Mission was not found.",
    "details": []
  },
  "requestId": "..."
}
```

## 14. Pagination

Use cursor pagination for large feeds where practical.

Example:

`?limit=20&cursor=...`

## 15. Idempotency

Required for:
- payment order creation where applicable
- payment webhook processing
- donation finalization
- critical state transitions

Use an idempotency key or provider event ID.

## 16. Authorization

Every protected resource must validate:

1. authentication
2. account status
3. role/capability
4. ownership or permitted relationship
5. target resource state
