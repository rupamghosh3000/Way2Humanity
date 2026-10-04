# Way2Humanity — Testing Strategy

## 1. Unit Tests

Test:

- validation
- mission state transitions
- reputation calculations
- risk classification logic
- permission helpers
- payment calculations
- ledger calculations

## 2. Integration Tests

Test:

- registration/login
- report creation
- evidence processing
- verification workflow
- helper assignment
- proof submission
- donation creation
- webhook processing
- dispute workflow

## 3. End-to-End Tests

Critical journey:

```text
Register
→ Verify account
→ Create report
→ Upload evidence
→ Verification
→ Mission publication
→ Helper acceptance
→ Work started
→ Proof submitted
→ Proof approved
→ Mission completed
```

Financial journey:

```text
Donor
→ Create checkout
→ Payment provider
→ Webhook
→ Donation paid
→ Ledger entry
→ Mission funding updated
```

## 4. Security Tests

Test:

- unauthorized admin access
- IDOR/resource ownership
- role escalation
- malformed uploads
- oversized uploads
- rate limiting
- webhook signature failures
- replayed webhooks
- injection attempts
- invalid tokens

## 5. Failure Tests

Simulate:

- AI provider unavailable
- storage unavailable
- payment provider unavailable
- database timeout
- duplicate webhook
- duplicate submission
- network interruption

The product must fail safely.

## 6. Accessibility

The supplied frontend design must still satisfy:
- keyboard navigation
- visible focus
- semantic controls
- accessible labels
- sufficient contrast
- meaningful error messages
- screen-reader-compatible structure

## 7. Acceptance Testing

Before launch, manually verify:
- all primary buttons perform real actions
- all forms persist data
- auth works
- role restrictions work
- payment status comes from server verification
- evidence privacy works
- admin tools are not publicly exposed
