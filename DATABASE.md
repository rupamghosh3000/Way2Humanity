# Way2Humanity — Database Specification

## 1. Database

MongoDB Atlas is recommended.

Use ObjectId references and indexes carefully. Avoid unbounded embedded arrays.

## 2. User

```text
User
- _id
- name
- email
- passwordHash
- avatarUrl
- roles[]
- phone
- city
- region
- locationApprox
- skills[]
- availability
- emailVerified
- status
- reputationSummary
- privacySettings
- createdAt
- updatedAt
```

Indexes:
- unique email
- status
- roles
- geospatial index on allowed location field

## 3. Mission

```text
Mission
- _id
- publicId
- seekerId
- title
- description
- category
- urgency
- riskLevel
- status
- location
- locationPrivacy
- requiredSkills[]
- resourceRequirements[]
- fundingEnabled
- fundingTarget
- fundingRaised
- verificationStatus
- assignedHelperId
- createdAt
- updatedAt
- publishedAt
- completedAt
```

Indexes:
- publicId unique
- seekerId
- status
- category
- urgency
- geospatial location
- createdAt

## 4. Evidence

```text
Evidence
- _id
- missionId
- uploaderId
- type
- storageKey
- mimeType
- size
- sha256
- metadata
- capturedAt
- uploadedAt
- visibility
- processingStatus
```

Indexes:
- missionId
- sha256
- uploaderId
- processingStatus

## 5. VerificationResult

```text
VerificationResult
- _id
- missionId
- evidenceIds[]
- provider
- model
- status
- overallRisk
- confidenceBand
- signals[]
- reasons[]
- requiresHumanReview
- reviewedBy
- reviewedAt
- createdAt
```

Do not store only a single opaque AI score.

## 6. Review

```text
Review
- _id
- targetType
- targetId
- reviewerId
- decision
- reasonCode
- notes
- evidenceReferences[]
- createdAt
```

## 7. MissionAssignment

```text
MissionAssignment
- _id
- missionId
- helperId
- status
- acceptedAt
- startedAt
- withdrawnAt
- completedAt
```

Unique index:
- missionId + active assignment rule

## 8. ProofOfWork

```text
ProofOfWork
- _id
- missionId
- helperId
- evidenceIds[]
- description
- completionLocation
- submittedAt
- reviewStatus
- reviewedBy
- reviewedAt
```

## 9. Donation

```text
Donation
- _id
- missionId
- donorId
- provider
- providerOrderId
- providerPaymentId
- amount
- currency
- fee
- netAmount
- status
- anonymous
- createdAt
- paidAt
- refundedAt
```

Indexes:
- missionId
- donorId
- providerPaymentId unique when present
- status

## 10. LedgerEntry

```text
LedgerEntry
- _id
- donationId
- missionId
- entryType
- amount
- currency
- reference
- createdAt
```

Ledger entries should not be silently mutated. Corrections should use compensating entries.

## 11. ReputationEvent

```text
ReputationEvent
- _id
- userId
- missionId
- type
- points
- reason
- createdAt
```

Points are derived from verified events.

## 12. Notification

```text
Notification
- _id
- userId
- type
- title
- body
- data
- readAt
- createdAt
```

## 13. CSROrganization

```text
CSROrganization
- _id
- ownerUserId
- legalName
- displayName
- logoUrl
- verificationStatus
- contactEmail
- createdAt
- updatedAt
```

## 14. CSRCampaign

```text
CSRCampaign
- _id
- organizationId
- name
- description
- targetAmount
- raisedAmount
- missionIds[]
- status
- startDate
- endDate
- brandedPageSlug
- createdAt
```

## 15. Dispute

```text
Dispute
- _id
- reporterId
- targetType
- targetId
- category
- description
- evidenceIds[]
- status
- assignedAdminId
- resolution
- createdAt
- resolvedAt
```

## 16. AuditEvent

```text
AuditEvent
- _id
- actorId
- actorRole
- action
- targetType
- targetId
- metadata
- ipHash
- userAgent
- createdAt
```

Do not store sensitive secrets in metadata.

## 17. Location Privacy

Store exact coordinates only when necessary and authorized.

For public discovery:
- round/blur coordinates
- show neighborhood/area rather than exact private address
- use approximate location where possible

## 18. Data Retention

Define retention by data category:

- financial records: according to applicable legal/accounting requirements
- security/audit logs: defined operational retention
- evidence: retained according to mission/legal requirements
- deleted account data: anonymize or delete according to documented policy

Final retention periods must be confirmed for the actual operating jurisdiction.
