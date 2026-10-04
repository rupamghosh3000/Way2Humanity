# WAY2HUMANITY — AUTONOMOUS FULL-SYSTEM QA & TESTING REPORT

**Date:** September 29, 2026  
**Target Application:** Way2Humanity — The Trust Layer for Growing Humanity Through Technology  
**QA Lead / Engineer:** Senior Autonomous QA & Security Test Lead  
**Overall Status:** **PASS**  

---

## 1. Executive Summary

A comprehensive full-system quality assurance, security, business logic, UX, accessibility, and performance test suite was executed across the **Way2Humanity** application.

The application has been verified to start cleanly, serve pages via Next.js App Router on `http://localhost:3000`, persist state accurately across both MongoDB and in-memory fallback stores, enforce strict server-side Role-Based Access Control (RBAC), and run the complete end-to-end humanitarian trust lifecycle.

One **CRITICAL** security vulnerability (IDOR on Mission PATCH route) and two **MEDIUM** resilience issues (missing MemoryStore fallback & missing upload MIME/extension sanitization) were autonomously discovered, diagnosed, fixed, and verified during this test pass.

---

## 2. Test Environment

| Parameter | Configuration / Version |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) |
| **Backend & APIs** | Next.js API Routes (`/api/v1/*`) |
| **Database** | MongoDB (Mongoose 8.2) + Dual In-Memory Store Fallback |
| **3D Rendering** | Three.js v0.162 + React Three Fiber / Drei |
| **Authentication** | JWT (jsonwebtoken 9.0) + bcryptjs + HTTP-Only Cookie (`w2h_access_token`) |
| **Payment Gateway** | Razorpay Sandbox API + HMAC SHA256 Webhook Verification |
| **Package Manager** | npm |
| **Environment Config** | `.env.local` / `.env.example` |
| **Host System** | Windows Local Development Server |

---

## 3. Tests Executed

| Category | Test Cases Executed | Result |
| :--- | :--- | :--- |
| **Authentication & Session** | Registration, Login, Invalid Password, Logout, Cookie Persistence, Token Expiry | **PASS** |
| **Server-Side RBAC** | Role permissions across SEEKER, HELPER, DONOR, CSR_ORGANIZATION, VERIFIER, ADMIN | **PASS** |
| **IDOR & Authorization** | Unauthorized mission edits, horizontal privilege escalation checks | **PASS (FIXED)** |
| **Mission State Machine** | DRAFT → SUBMITTED → VERIFYING → PUBLISHED → ASSIGNED → IN_PROGRESS → PROOF_SUBMITTED → REVIEWING → COMPLETED | **PASS** |
| **Evidence Processing** | Presigned uploads, MIME validation, filename sanitization, SHA-256 duplicate detection | **PASS (FIXED)** |
| **AI Verification Engine** | Unstructured text parsing, risk aggregate scoring, signal generation, human-review triggers | **PASS** |
| **Helper Operations** | Mission discovery, Haversine matching, acceptance, work start, proof of work submission | **PASS** |
| **Donation & Financial Ledger** | Razorpay order creation, HMAC SHA256 signature verification, append-only ledger entries | **PASS** |
| **Humanity Passport & Points** | Verified proof approval, +50 Humanity Points allocation, reputation event logging | **PASS** |
| **CSR Command Center** | Campaign creation, organization verification, corporate impact metrics | **PASS** |
| **Admin Operations** | User suspension, human verification queues, proof approval, audit log inspection | **PASS** |
| **Design & UI Compliance** | Warm ivory palette, editorial serif typography, WebGL 3D canvas, anti-pattern checks | **PASS** |
| **Accessibility & Motion** | Keyboard navigation, aria attributes, reduced-motion fallbacks, non-WebGL degradation | **PASS** |

---

## 4. User Journeys Tested & Verified

### Journey 1: Complete Seeker to Helper Humanitarian Flow
1. **Registration & Auth:** User registers as a `SEEKER` via `/register`. Account is created and HTTP-only cookie set.
2. **Report Creation:** Seeker creates a problem report via `/report`. Text is parsed by AI Mission Copilot into structured fields.
3. **Evidence Upload & Verification:** Upload URL requested via `/api/v1/uploads/presign`. MIME type (`image/jpeg`) and filename extension (`.jpg`) are sanitized. SHA-256 hash computed.
4. **Mission Submission:** Seeker submits report (`/api/v1/missions/[publicId]/submit`). State transitions from `DRAFT` to `VERIFYING` and auto-approves to `PUBLISHED` based on low risk score.
5. **Helper Discovery & Acceptance:** A `HELPER` user discovers the mission on `/radar` or `/helper`. Accepts mission via `/api/v1/missions/[publicId]/accept`. State transitions to `ASSIGNED`.
6. **Work Execution & Proof Submission:** Helper starts work (`/api/v1/missions/[publicId]/start` → `IN_PROGRESS`) and submits photo proof via `/api/v1/missions/[publicId]/proof` (`PROOF_SUBMITTED`).
7. **Verification Review & Points Award:** Admin/Verifier reviews proof (`/api/v1/proof/[id]/review`). Decision: `APPROVE`. Mission transitions to `COMPLETED`. Helper receives +50 Humanity Points in their `Humanity Passport`.

### Journey 2: Transparent Fundraising & Financial Ledger Flow
1. **Fundraising Enablement:** Mission created with `fundingEnabled: true` and `fundingTarget: 25000`.
2. **Order Creation:** Donor initiates contribution via `/api/v1/missions/[publicId]/donations/order`. Pending donation record created.
3. **Razorpay Webhook Verification:** Payment webhook (`/api/v1/payments/webhook`) receives `order.paid` event, verifies `x-razorpay-signature` using HMAC SHA256.
4. **Ledger Persistence:** `Donation` status updated to `PAID`. Financial ledger records `CREDIT_DONATION` (97% net impact) and `PLATFORM_FEE` (3% fee). Mission `fundingRaised` increments automatically.

---

## 5. Bugs Found, Diagnosed, and Fixed

### Bug ID 1: IDOR Vulnerability on Mission PATCH Endpoint
- **Severity:** **CRITICAL**
- **Description:** `PATCH /api/v1/missions/[publicId]` permitted any authenticated user to update title, description, or location of any mission regardless of who created it.
- **Root Cause:** Missing ownership check (`mission.seekerId === auth.user.id`) and missing role check for `ADMIN`.
- **Fix Applied:** Enforced strict ownership & admin verification in `src/app/api/v1/missions/[publicId]/route.ts`. Stripped protected fields (`publicId`, `seekerId`, `status`, `verificationStatus`, `fundingRaised`).
- **Retest Result:** **PASS**. Non-owner requests return HTTP `403 Forbidden`.

### Bug ID 2: Missing MemoryStore Fallback in Verification Review & Mission Submit
- **Severity:** **MEDIUM**
- **Description:** Submitting a mission or reviewing a verification decision threw a runtime exception when running in non-MongoDB / local MemoryStore fallback mode.
- **Root Cause:** Direct call to `Mission.findById()` without checking `if (!db)`.
- **Fix Applied:** Added `memoryStore` query fallback and support for both `publicId` (e.g. `MSN-...`) and ObjectId lookups in `src/app/api/v1/missions/[publicId]/submit/route.ts` and `src/app/api/v1/verification/[missionId]/review/route.ts`.
- **Retest Result:** **PASS**. Operations succeed seamlessly with or without MongoDB.

### Bug ID 3: Unsanitized File Extensions & Missing MIME Validation in Presign Service
- **Severity:** **MEDIUM**
- **Description:** `/api/v1/uploads/presign` allowed requesting presigned URLs for arbitrary extensions (e.g. `.exe`, `.html`, `.php`) and arbitrary MIME types.
- **Root Cause:** `storage.ts` extracted extensions via `split('.').pop()` without whitelist checks.
- **Fix Applied:** Implemented strict MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`, `video/mp4`) and filename extension sanitization in `src/lib/services/storage.ts`.
- **Retest Result:** **PASS**. Invalid MIME types throw explicit error messages.

### Bug ID 4: HTTP 500 Error on GET /api/v1/helper/missions in Fallback & Non-ObjectId Session Modes
- **Severity:** **MEDIUM**
- **Description:** `GET /api/v1/helper/missions` crashed with a 500 error when un-persisted session user IDs or memory store users called the endpoint.
- **Root Cause:** Unhandled Mongoose CastError on `User.findById(auth.user.id)` and missing fallback store query handler.
- **Fix Applied:** Added ObjectId regex validation, try-catch safety net, and MemoryStore fallback in `src/app/api/v1/helper/missions/route.ts`.
- **Retest Result:** **PASS**. Endpoint now returns HTTP 200 with structured matching scores across all session states.

---

## 6. Security Findings & Hardening

1. **Server-Side RBAC Enforcement:** All protected routes in `/api/v1/admin/*`, `/api/v1/verification/*`, and `/api/v1/proof/*/review` verify roles via `requireAuth(req, allowedRoles)` in `src/lib/auth/guards.ts`.
2. **Password Security:** Passwords hashed with `bcryptjs` (salt rounds: 10). Password hashes excluded from API responses (`select('-passwordHash')`).
3. **HMAC Webhook Verification:** Razorpay webhooks validated via HMAC SHA256 using `crypto.createHmac()`.
4. **Audit Logging:** All sensitive state transitions (`USER_REGISTERED`, `MISSION_CREATED`, `MISSION_SUBMITTED`, `HELPER_ACCEPTED`, `PROOF_SUBMITTED`, `PROOF_APPROVED`, `DONATION_PAID`) emit immutable records into `AuditEvent` model.

---

## 7. Accessibility & UI/UX Design Compliance

- **Design Philosophy:** Checked against `design (3).md`. The UI employs warm ivory (`#F9F8F6`), soft black (`#2C2B29`), muted terracotta (`#C28F7B`), and sage green (`#8A9A86`).
- **Prohibited Aesthetics Check:**
  - ❌ NO Bento grids
  - ❌ NO Cyberpunk / Neon tropes
  - ❌ NO Generic 3-card pricing tables
  - ❌ NO Glassmorphism or heavy drop shadows
  - ❌ NO Fake statistics or testimonials
- **3D Canvas:** `GlobalCanvas` uses Three.js / React Three Fiber with soft directional lighting and scroll-driven camera progress orchestration.
- **Reduced Motion & WebGL Fallback:** Text content resides in semantic DOM elements (`h1`-`h6`, `p`, `button`). UI degrades gracefully to static photography when WebGL is unmounted or disabled.

---

## 8. Remaining Blockers & External Dependencies

- **External Production Payment Key:** Razorpay integration runs in **TEST / SANDBOX** mode. Production live keys (`rzp_live_*`) must be configured prior to deployment.
- **External AI Vision API:** AI Verification uses rule-based heuristic signals and fallback vision models. A live `GEMINI_API_KEY` can be provided in `.env.local` for production multi-modal Gemini vision analysis.

---

## 9. Final Status

# **PASS**

*The Way2Humanity application runs cleanly, enforces strict security & authorization, persists data accurately across all humanitarian user journeys, passes unit and integration verification tests, and complies with design specifications.*
