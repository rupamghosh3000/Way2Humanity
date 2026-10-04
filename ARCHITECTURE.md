# Way2Humanity — System Architecture

## 1. Architecture Style

Recommended initial architecture:

**Modular monolith + asynchronous workers**

This gives the MVP a manageable deployment footprint while keeping clear module boundaries so services can later be extracted.

```text
Browser / Mobile Web
        |
        v
   Next.js Frontend
        |
        v
 API / Application Server
        |
  +-----+-------------------------+
  |     |      |       |          |
Auth  Missions Payments Evidence  CSR
  |     |      |       |          |
  +-----+------+-------+----------+
        |
        +---- MongoDB
        |
        +---- Object Storage
        |
        +---- Queue / Worker
                  |
          +-------+--------+
          |                |
      AI Verification   Notifications
```

## 2. Frontend

Responsibilities:

- rendering
- forms
- client-side validation for UX
- API calls
- session state
- upload progress
- maps
- dashboards
- accessibility

The frontend must not contain privileged business logic.

## 3. Backend Modules

### Auth Module

- registration
- login
- OAuth
- sessions
- password reset
- email verification

### User Module

- profile
- preferences
- account state

### Mission Module

- report creation
- mission lifecycle
- discovery
- assignment
- completion

### Evidence Module

- upload authorization
- metadata extraction
- hashing
- evidence records
- access control

### Verification Module

- AI jobs
- verification signals
- reviewer workflows
- risk classification

### Matching Module

- helper eligibility
- location matching
- skill matching
- ranking for suggestions

### Payment Module

- checkout creation
- payment records
- webhooks
- refunds
- reconciliation

### Reputation Module

- points ledger
- reputation events
- Humanity Passport

### Notification Module

- email
- in-app
- future SMS/WhatsApp

### CSR Module

- organization profiles
- campaigns
- branded impact pages
- reports

### Moderation Module

- reports
- disputes
- account actions

### Audit Module

- immutable event-style records
- actor
- action
- target
- timestamp
- request context

## 4. Asynchronous Jobs

Use a queue for:

- image processing
- metadata extraction
- AI analysis
- duplicate similarity
- email notifications
- report generation
- analytics aggregation

The API should return a job/status state rather than block for expensive AI operations.

## 5. Storage

### MongoDB

Use for:

- users
- missions
- evidence metadata
- verification results
- payments
- donations
- proof
- reputation
- notifications
- audit events
- CSR campaigns

### Object storage

Use for:

- original images
- processed images
- proof images
- documents
- generated reports

Never expose raw bucket credentials to the frontend.

## 6. External Services

Potential production integrations:

- Google OAuth
- Maps provider
- AI/vision provider
- email provider
- payment provider
- object storage/CDN
- error monitoring

Every external provider must be isolated behind a service adapter where practical.

## 7. Security Boundaries

```text
Public
  |
  v
Rate Limited API
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Business Logic
  |
  +--> Database
  +--> Object Storage
  +--> External Providers
```

No direct browser-to-database access.

## 8. Event Model

Important events should produce audit records:

`MISSION_CREATED`
`EVIDENCE_UPLOADED`
`VERIFICATION_COMPLETED`
`REVIEW_REQUESTED`
`MISSION_APPROVED`
`MISSION_REJECTED`
`HELPER_ACCEPTED`
`WORK_STARTED`
`PROOF_SUBMITTED`
`PROOF_APPROVED`
`MISSION_COMPLETED`
`DONATION_CREATED`
`DONATION_PAID`
`DONATION_REFUNDED`
`DISPUTE_OPENED`
`DISPUTE_RESOLVED`

## 9. Scalability Path

MVP:

- one backend application
- one worker
- one database
- object storage
- CDN

Later:

- separate verification workers
- separate notification worker
- payment service
- analytics service
- search service
- dedicated recommendation/matching service
