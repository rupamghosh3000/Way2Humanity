# Way2Humanity — Product Requirements Document

## 1. Product Overview

Way2Humanity is an AI-assisted community impact platform built around a central idea: create a trustworthy connection between people who report needs, people who help, donors, and organizations.

The platform addresses three problems identified in the product presentation:

1. **Fake News & Fraud:** It can be difficult to determine whether submitted evidence of a problem is genuine.
2. **The Black Hole Effect:** Donors and volunteers may not know whether their contribution reached the intended outcome.
3. **Disconnected Communities:** Helpers and Seekers can exist in the same locality without a reliable mechanism to connect.

The product creates a trust chain:

`Report → Evidence Verification → Review → Helper/Donor Action → Proof → Impact Record`

## 2. Product Goals

### Primary goals

- Allow a Seeker to report a real-world problem.
- Capture evidence and approximate/precise location with appropriate privacy controls.
- Perform automated AI-assisted evidence checks.
- Route uncertain or high-risk cases to human verification.
- Publish verified missions.
- Match missions with relevant Helpers.
- Allow Helpers to accept and complete missions.
- Require proof of work for completion.
- Enable transparent fundraising for eligible missions.
- Maintain a financial ledger.
- Build verified reputation from completed actions.
- Give donors and organizations an impact trail.
- Provide CSR organizations with campaign and reporting tools.

### Non-goals for initial MVP

- Fully autonomous humanitarian decision-making.
- Guaranteed image authenticity.
- Government-grade identity verification for every user.
- Cryptocurrency/token economy in MVP.
- Global multi-currency complexity unless explicitly enabled.
- Medical/legal emergency dispatch.
- Emergency response replacement for official services.

## 3. Core User Types

### Seeker

A person who needs assistance or reports a community problem.

### Helper

A volunteer/person willing to perform an action.

### Donor

A person funding an eligible mission.

### CSR Organization

A company/organization funding or sponsoring community missions and requiring impact reporting.

### Verifier

A trusted reviewer handling cases requiring human verification.

### Admin

Platform operator with operational, moderation, configuration, and audit access.

## 4. Core Product Modules

### 4.1 Authentication

Requirements:

- Email/password registration.
- Secure password hashing.
- Email verification.
- Login/logout.
- Password reset.
- Optional Google OAuth.
- Session/token management.
- Rate limiting.
- Account status: active, suspended, pending verification.
- Server-side role enforcement.

### 4.2 User Profiles

Common fields:

- Name
- Profile photo
- Email
- Phone where required
- City/region
- Account role/capabilities
- Verification status
- Created date
- Reputation summary

Privacy-sensitive fields must not be publicly exposed.

### 4.3 Problem Reporting

A Seeker can create a report containing:

- Title
- Description
- Category
- Urgency
- Location
- Photos
- Optional video
- Resource/help required
- Estimated funding need if applicable
- Consent/attestation
- Contact preference

The system generates a unique case/mission ID.

### 4.4 Evidence Processing

For every uploaded evidence item:

- Generate secure object-storage reference.
- Extract file metadata where available.
- Calculate cryptographic hash.
- Detect duplicate/reused files.
- Record upload timestamp.
- Record source metadata when available.
- Run AI-assisted analysis.
- Generate verification signals.
- Never overwrite the original evidence.

### 4.5 AI Verification

The system produces signals such as:

- File integrity signal
- Duplicate/similarity signal
- Metadata consistency signal
- Visual anomaly/manipulation signal
- Geolocation consistency signal where technically possible
- Context consistency signal
- Overall risk/confidence band

Possible outcome:

- `PASS_AUTO_REVIEW`
- `NEEDS_HUMAN_REVIEW`
- `FLAGGED`
- `INSUFFICIENT_EVIDENCE`

AI output must remain explainable at the signal level.

### 4.6 TrustGraph

Every important mission stage becomes an auditable event:

- Report created
- Evidence uploaded
- AI verification completed
- Human review completed
- Mission published
- Helper matched/accepted
- Donation received
- Work started
- Proof submitted
- Proof reviewed
- Mission completed
- Dispute opened/resolved

The UI can later visualize this chain using the supplied frontend design.

### 4.7 Mission Marketplace / Humanity Radar

Verified missions can be discoverable by eligible Helpers.

Filters:

- Distance
- Category
- Urgency
- Required skill
- Funding requirement
- Status

Location data must respect privacy settings.

### 4.8 Mission Matching

Initial matching score may use:

- distance
- required skill
- availability
- category
- urgency
- previous mission experience

Matching is advisory. A Helper's acceptance remains explicit.

### 4.9 Helper Workflow

States:

`AVAILABLE → ACCEPTED → IN_PROGRESS → PROOF_SUBMITTED → REVIEWED → COMPLETED`

A Helper can:

- accept mission
- withdraw before work begins
- update status
- communicate through supported channels
- upload proof
- submit completion notes

### 4.10 Proof of Work

Completion evidence may include:

- after-photo(s)
- optional video
- description
- completion timestamp
- location consistency signal
- cost/resource notes
- beneficiary confirmation where applicable

Proof must be reviewed when required by mission risk rules.

### 4.11 Fundraising

Eligible missions can have:

- target amount
- collected amount
- donor count
- funding status
- transaction records
- campaign updates

Supported states:

`DRAFT → ACTIVE → FUNDED/PARTIALLY_FUNDED → CLOSED`

Payment provider webhook is authoritative for payment status.

### 4.12 Financial Ledger

For every successful transaction, maintain:

- transaction ID
- provider ID
- mission ID
- donor ID if permitted
- amount
- currency
- fee
- net amount
- status
- timestamps
- refund state

The ledger is append-oriented and auditable.

### 4.13 Humanity Passport

A Helper profile may show verified contribution statistics:

- missions completed
- communities helped
- categories served
- verified proof submissions
- reputation events
- Humanity Points

Only verified actions should contribute to reputation.

### 4.14 Success Gallery

Completed missions may appear publicly after privacy/moderation checks.

Do not expose:
- exact private addresses
- private phone numbers
- sensitive personal information
- evidence that a user did not consent to publish

### 4.15 CSR Command Center

CSR organizations can:

- create campaigns
- fund missions
- sponsor categories/regions
- create branded impact pages
- view campaign metrics
- export reports

Metrics may include:

- funds deployed
- missions funded
- missions completed
- people/community units reached
- geographic coverage
- completion rate
- verified impact events

Metrics must clearly distinguish measured facts from estimates.

## 5. Unique Product Features

### TrustGraph

Visualized chain of evidence and actions.

### Humanity Radar

Location-based mission discovery for Helpers.

### Impact Chain

Donation/action/proof timeline showing the lifecycle of an intervention.

### AI Mission Copilot

Converts an unstructured problem description into structured mission fields and asks follow-up questions.

### Mission Matching Engine

Suggests relevant missions to Helpers based on distance, category, skills, availability, and urgency.

### Evidence Vault

Immutable-ish evidence references with hashes, metadata, verification signals, and review history.

### Humanity Heatmap

Aggregated impact visualization without exposing sensitive individual information.

### Second Verification

High-risk/high-value missions can require:

`AI assessment → community/trusted verifier → human review`

This is not required for every case.

## 6. Mission Risk Levels

### LOW

Low-value, non-sensitive community issue.

May use automated checks with lightweight review.

### MEDIUM

Higher impact or moderate financial/resource involvement.

Requires stronger evidence and may require verifier review.

### HIGH

High-value, sensitive, repeated suspicious behavior, or significant risk.

Requires human verification before publication or funding.

## 7. Notifications

Channels:

- in-app
- email
- optional SMS/WhatsApp integration later

Events:

- report received
- verification completed
- human review requested
- mission published
- helper accepted
- proof submitted
- proof approved/rejected
- donation successful
- campaign milestone
- dispute update

## 8. Admin Operations

Admin can:

- manage users
- suspend accounts
- manage missions
- review verification cases
- review proof
- review disputes
- view payments
- manage categories
- manage featured/success stories
- inspect audit logs
- manage platform settings

Admin endpoints must never rely on frontend hiding.

## 9. Disputes

Users can report:

- false mission
- fraudulent evidence
- incorrect completion
- payment issue
- harassment/abuse
- misuse of funds

Disputes have:

`OPEN → UNDER_REVIEW → RESOLVED/REJECTED`

## 10. Acceptance Criteria

The MVP is considered functional when a complete test journey can run:

1. User registers.
2. User verifies account.
3. Seeker creates report.
4. Evidence uploads successfully.
5. Evidence receives verification signals.
6. Appropriate review occurs.
7. Mission becomes published if approved.
8. Helper discovers mission.
9. Helper accepts mission.
10. Helper submits proof.
11. Proof is reviewed.
12. Mission becomes completed.
13. Humanity Points/reputation update.
14. Donor can fund an eligible mission.
15. Payment webhook updates ledger.
16. Mission impact updates reflect actual records.
17. Admin can audit the complete chain.

## 11. Production Quality Requirements

- Responsive frontend.
- Accessible interactions.
- Secure file handling.
- Strong authentication.
- Role-based authorization.
- Rate limiting.
- Input validation.
- Audit logs.
- Error monitoring.
- Backups.
- Payment webhook verification.
- AI failure fallback.
- Human-review fallback.
- No critical workflow depends on client-side state.
