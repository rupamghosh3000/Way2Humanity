# Way2Humanity — Claude Code / AI Development Instructions

## 1. Project Identity

**Product:** Way2Humanity  
**Tagline:** The Trust Layer  
**Mission:** Growing Humanity Through Technology

Way2Humanity is a community-impact platform connecting people who need help (Seekers) with people willing to help (Helpers), while introducing a trust layer for evidence verification, action tracking, proof of work, donations, and impact transparency.

The system must be built as a real, deployable application. Do not implement fake buttons, fake API responses, hard-coded success states, mock authentication in production paths, or simulated payment completion.

## 2. Source of Truth

Use these project files as the primary specification:

1. `PRD.md` — product requirements and acceptance criteria
2. `ARCHITECTURE.md` — system architecture and service boundaries
3. `TECHSTACK.md` — technology choices
4. `DATABASE.md` — data model
5. `API.md` — API contracts
6. `AI_VERIFICATION.md` — verification pipeline
7. `SECURITY.md` — security requirements
8. `ROLES.md` — authorization model
9. `BUSINESS_LOGIC.md` — workflows and state transitions
10. `DEPLOYMENT.md` — production deployment
11. `TESTING.md` — testing requirements
12. `IMPLEMENTATION_PLAN.md` — build sequence
13. `DATA.md` — seed/demo data rules
14. `README.md` — setup and operating instructions

`DESIGN.md` is intentionally absent. The frontend design will be supplied separately by the product owner. Do not invent a replacement design specification.

If a later design file conflicts with implementation assumptions, preserve functionality and adapt the UI layer without weakening security, accessibility, or business rules.

## 3. Engineering Principles

- Production-first, not prototype-only.
- TypeScript throughout the web/backend code where applicable.
- Strong server-side validation.
- Server-side authorization is mandatory.
- Never trust client-provided roles, ownership, verification status, payment status, GPS trust, or completion state.
- Use database transactions for financial and critical state changes where supported.
- Store files in object storage; do not store large binary evidence directly in MongoDB.
- Keep secrets in environment variables.
- Never commit `.env`.
- Never log passwords, tokens, payment secrets, private evidence URLs, or sensitive personal data.
- Use structured logging and meaningful error codes.
- Every important state change should be auditable.
- Prefer idempotent endpoints for webhooks and payment callbacks.
- Do not make AI decisions the sole irreversible authority for high-impact cases.
- Uncertain/high-risk verification must support human review.

## 4. Role Model

Supported account roles:

- `SEEKER`
- `HELPER`
- `DONOR`
- `CSR_ORGANIZATION`
- `VERIFIER`
- `ADMIN`

A user may have more than one capability in the future, but authorization must be capability-based and server-enforced.

Admin functionality must not be exposed as an ordinary public navigation item.

## 5. AI Rules

AI verification is an evidence-risk assessment system, not a guarantee of truth.

Never display language such as:
- "AI proves this is 100% real"
- "AI guarantees authenticity"

Prefer:
- "Verification confidence"
- "Evidence risk assessment"
- "Requires human review"
- "Metadata unavailable"
- "Potential manipulation detected"

## 6. Payments

Development may use test/sandbox payments. Production must use a real supported payment provider.

Never mark a donation successful solely because the browser redirected to a success page. Confirm through the provider's signed webhook/server verification.

## 7. Definition of Done

A feature is complete only when:

- UI exists
- API exists
- database persistence exists
- validation exists
- authorization exists
- loading/error/empty states exist
- audit events exist where applicable
- tests exist for important paths
- production configuration is documented
- no critical TODO remains in the path
