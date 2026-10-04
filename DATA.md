# Way2Humanity — Data and Seed Strategy

## 1. Development Seed Data

Seed data is allowed only for local/staging environments.

Never present seed records as real community impact in production.

## 2. Example Categories

- Food Support
- Education
- Healthcare Support
- Infrastructure
- Emergency Assistance
- Elder Support
- Accessibility
- Environmental Cleanup
- Community Resources
- Other

Categories should remain configurable.

## 3. Example Urgency

- LOW
- MEDIUM
- HIGH
- CRITICAL

Critical should have operational safeguards and should not be represented as a substitute for emergency services.

## 4. Seed Accounts

Create clearly marked development accounts:

- seeker@example.test
- helper@example.test
- donor@example.test
- verifier@example.test
- csr@example.test
- admin@example.test

Use development-only passwords/secrets.

## 5. Demo Missions

Demo missions must have an explicit flag:

`isDemo: true`

Production queries should exclude demo records unless an administrator intentionally enables them.

## 6. Data Integrity

Never seed fake:
- real payment transactions
- real donor amounts
- real beneficiary identities
- fake verification results presented as actual AI findings

## 7. Analytics

Metrics must distinguish:
- real
- demo
- estimated
- aggregated

## 8. Export

CSV/PDF exports must apply authorization and privacy filtering before generation.
