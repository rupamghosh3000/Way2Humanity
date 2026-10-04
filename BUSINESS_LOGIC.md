# Way2Humanity — Business Logic and State Machines

## 1. Mission Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
VERIFYING
  ├──→ NEEDS_MORE_INFO
  ├──→ REJECTED
  └──→ APPROVED
          ↓
       PUBLISHED
          ↓
       ASSIGNED
          ↓
       IN_PROGRESS
          ↓
     PROOF_SUBMITTED
          ↓
       REVIEWING
       ├──→ PROOF_REJECTED
       │       ↓
       │  IN_PROGRESS
       └──→ PROOF_APPROVED
                 ↓
             COMPLETED
```

## 2. Report Rules

- A Seeker cannot directly publish a mission.
- A report must pass required verification/review.
- Required evidence depends on category/risk.
- High-risk reports require human review.
- Rejected reports cannot accept donations.

## 3. Helper Acceptance

A mission can have one active primary Helper unless the mission explicitly supports multiple Helpers.

When accepting:
- verify mission is still available
- verify Helper eligibility
- create assignment
- update mission state atomically
- emit audit event
- notify relevant users

## 4. Withdrawal

A Helper may withdraw before completion.

Repeated withdrawals can affect reputation only according to an explicit published policy.

Never deduct points arbitrarily.

## 5. Proof Rules

A Helper must submit required evidence before completion.

Proof review can:
- approve
- reject
- request more evidence

A mission cannot become completed until required proof is approved.

## 6. Donation Rules

Only eligible missions can receive donations.

Donation amount must be:
- positive
- within configured limits
- valid currency

Donation success comes from provider verification.

## 7. Refund

Refund must:
- be linked to original transaction
- update payment state
- create compensating ledger entry
- preserve original transaction history

## 8. Reputation

Points are awarded only for verified events.

Example configurable events:

- mission completed
- proof approved
- successful verified assistance
- constructive review participation

Do not award points merely for:
- opening app
- clicking buttons
- submitting unverified reports

## 9. Dispute Rules

Opening a dispute does not automatically punish a user.

Disputes must be reviewed using evidence.

## 10. TrustGraph Event Rule

Every material state transition creates an audit/trust event.

The event should contain:
- actor
- action
- target
- previous state
- new state
- timestamp
- relevant non-sensitive metadata

## 11. Funding Completion

A mission being fully funded does not mean the mission is completed.

Funding and impact completion are separate states.

## 12. Privacy Rule

Public impact information should be aggregated or generalized where exact information could expose a vulnerable person.

## 13. Admin Override

Admin overrides must:
- require authorization
- require a reason
- create an audit event
- never delete financial history
