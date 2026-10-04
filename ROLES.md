# Way2Humanity — Roles and Authorization

## 1. SEEKER

Can:
- create reports
- upload evidence
- view own missions
- respond to reviewer requests
- view permitted mission progress
- open disputes

Cannot:
- approve own verification
- approve own proof
- manipulate donation ledger
- access admin tools

## 2. HELPER

Can:
- browse eligible missions
- accept missions
- start missions
- submit proof
- view own reputation
- withdraw under allowed rules

Cannot:
- approve own proof
- edit verified mission facts
- access private admin information

## 3. DONOR

Can:
- browse eligible fundraising missions
- make donations
- view own donation records
- view public impact information

Cannot:
- alter ledger
- mark donations successful

## 4. CSR_ORGANIZATION

Can:
- manage organization profile
- create CSR campaigns
- sponsor missions
- view campaign analytics
- generate reports
- manage branded impact page content

## 5. VERIFIER

Can:
- view assigned review cases
- inspect evidence
- record review decisions
- request more evidence
- review proof

Cannot:
- modify payment records
- grant themselves admin privileges

## 6. ADMIN

Can:
- operational moderation
- user management
- mission management
- review escalations
- dispute handling
- category/configuration management
- audit access
- payment monitoring

Admin authorization is server-side only.

## 7. Resource Ownership

A user can access a resource when:

- they own it, or
- they are explicitly assigned, or
- their role grants access, or
- the resource is public.

Every resource controller must implement an authorization check.
