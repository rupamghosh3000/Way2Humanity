# WAY2HUMANITY — THE TRUST LAYER

> **MISSION:** *“Growing Humanity Through Technology”*  
> An auditable community-impact platform connecting Seekers, Helpers, Donors, and CSR organizations through evidence verification, mission workflows, proof of work, transparent funding, and impact tracking.

---

## 📖 1. PRODUCT OVERVIEW & PHILOSOPHY

Way2Humanity functions as a **humanitarian digital art experience** and a **real working trust platform**. The core philosophy is **"People helping people."** Technology acts exclusively as the invisible trust layer supporting human connection.

### Core Problems Solved:
1. **Fake News & Fraud:** Eliminates unverified community claims using a 4-stage AI evidence verification pipeline, SHA-256 cryptographic hashing, EXIF metadata validation, and mandatory human verifier reviews.
2. **The Black Hole Effect:** Eliminates untracked contributions by requiring verified proof of work (before/after photos) before a mission is marked completed, linked directly to an append-only financial ledger.
3. **Disconnected Communities:** Bridges local gaps through the **Humanity Radar**, a topographic discovery map matching Helpers with nearby Seekers based on location, skills, and urgency.

---

## 🏗️ 2. SYSTEM ARCHITECTURE & DATA FLOW

Way2Humanity is architected as a **modular monolith with asynchronous background workers**, built for zero-downtime execution and clear microservice extraction boundaries.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER & MOBILE CLIENT                               │
│                                                                                 │
│  Layer 0: Global WebGL 3D Canvas (Three.js / React Three Fiber)                  │
│  Layer 1: Narrative DOM Typography & GSAP ScrollTrigger Story                   │
│  Layer 2: Interactive Application Overlay (Radar, Passport, CSR, Admin)        │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS / REST API
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION & API SERVER (/api/v1/...)              │
│                                                                                 │
│   ┌───────────────┬────────────────┬────────────────┬────────────────────────┐  │
│   │ Auth Guard    │ Mission Engine │ Evidence Vault │ AI Verification        │  │
│   │ RBAC Middleware│ Helper Match  │ Payment Engine │ Financial Ledger       │  │
│   │ Audit Logger  │ CSR Portal     │ Moderation     │ Reputation Engine      │  │
│   └───────┬───────┴───────┬────────┴───────┬────────┴──────────┬─────────────┘  │
└───────────┼───────────────┼────────────────┼───────────────────┼────────────────┘
            │               │                │                   │
            ▼               ▼                ▼                   ▼
   ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
   │ MongoDB Atlas  │ │ MemoryStore  │ │ Object       │ │ External APIs    │
   │ (Mongoose DB)  │ │ (Offline DB) │ │ Storage      │ │ - Razorpay API   │
   │                │ │ Fallback     │ │ (S3/Vault)   │ │ - Gemini AI API  │
   └────────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘
```

### 2.1 UI Layer Architecture (3D + DOM Orchestration)
The application implements a 3-layer visual stacking model:
- **Layer 0 (Background WebGL Canvas):** Three.js canvas rendering organic 3D objects (clay hands, paper document mesh, ceramic nodes, physical threads, floating shards) with studio lighting and soft shadow mapping.
- **Layer 1 (Narrative Scroll):** DOM typography synced to scroll progress scrubbing through the camera timeline:  
  `NEED` → `REPORT` → `VERIFY` → `CONNECT` → `HELP` → `PROVE` → `IMPACT` → `HUMANITY`.
- **Layer 2 (Interactive UI Overlay):** Fixed minimal navigation bar, modal dialogs, and specialized application dashboards.

### 2.2 Security Boundaries & Authorization Flow
```text
Browser Client ──> Rate Limiter ──> JWT Auth Guard ──> Server RBAC Check ──> Business Logic ──> Database
```
1. **No Client Trust:** Server routes enforce authorization capability checks (`requireAuth(req, allowedRoles)`). Client claims (such as `isAdmin` or `isVerified`) are never trusted.
2. **Database Protection:** Direct browser-to-database connections are strictly prohibited.
3. **Signed URLs:** Private evidence files require time-limited signed access URLs.

### 2.3 Storage Architecture Key Hierarchy
Object storage buckets use strict key namespace prefixes:
```text
uploads/original/    # Raw uploaded evidence files
uploads/processed/   # Thumbnails & processed images
proof/               # Verified completion proof photos
reports/             # Generated PDF/CSV CSR impact reports
```

### 2.4 Event & Audit Model
Every critical business state transition creates an append-only, immutable `AuditEvent` record for TrustGraph visualization and regulatory auditability:

```text
MISSION_CREATED ──> EVIDENCE_UPLOADED ──> VERIFICATION_COMPLETED ──> REVIEW_REQUESTED
        │
        ▼
MISSION_APPROVED ──> PUBLISHED ──> HELPER_ACCEPTED ──> WORK_STARTED ──> PROOF_SUBMITTED
        │
        ▼
PROOF_APPROVED ──> COMPLETED ──> DONATION_PAID ──> LEDGER_RECORDED ──> REPUTATION_AWARDED
```

---

## 🛠️ 3. TECHNOLOGY STACK

### Frontend & WebGL 3D Experience
- **Framework:** Next.js 14 (App Router)
- **UI & Logic:** React 18, TypeScript, Tailwind CSS
- **3D Canvas & WebGL:** Three.js (`@react-three/fiber`, `@react-three/drei`)
- **Typography:** Newsreader / Playfair Display (Serif) for editorial headings; Inter / Plus Jakarta Sans for UI
- **Design Tokens:** Warm Ivory (`#F9F8F6`), Deep Charcoal (`#2C2B29`), Muted Terracotta (`#C28F7B`), Muted Green (`#8A9A86`), Warm Amber (`#D9A05B`), Taupe (`#E3DCD2`)
- **Icons & Motion:** Lucide React, Framer Motion

### Backend & API
- **Runtime:** Node.js 18+ LTS
- **Architecture:** Next.js Modular REST API (`/api/v1/...`)
- **Validation:** Zod schemas on client and server
- **Security Headers:** Helmet, CORS allowlist, rate limiting

### Database & Storage
- **Primary Database:** MongoDB Atlas / Local MongoDB via Mongoose
- **Zero-Dependency Local Mode:** MemoryStore Fallback Engine (allows full functionality even if local MongoDB daemon is offline)
- **Evidence Storage:** Object Storage Service with SHA-256 hash calculation, EXIF metadata extraction, presigned uploads, and signed private URLs

### Authentication & Authorization
- **Security:** Password hashing via Argon2 / bcryptjs
- **Session Strategy:** JWT Access Tokens (1d) & Refresh Tokens (7d) stored in HTTP-only cookies
- **Server-Side RBAC:** Capability-based access control protecting routes for `SEEKER`, `HELPER`, `DONOR`, `CSR_ORGANIZATION`, `VERIFIER`, and `ADMIN`

### Payments & Financial Ledger
- **Payment Provider:** Razorpay API (Sandbox / Production)
- **Webhook Security:** HMAC SHA-256 signature verification & event idempotency
- **Ledger Accounting:** Append-only `LedgerEntry` records (`CREDIT_DONATION`, `PLATFORM_FEE`) with 3% fee allocation

### AI Verification Pipeline
- **AI Provider:** Google Generative AI (`@google/generative-ai` / Gemini API)
- **Capabilities:** Unstructured text parsing (AI Mission Copilot), visual anomaly detection, context consistency scoring, explainable risk signal breakdown

---

## ✨ 4. FEATURE MATRIX & CORE USER JOURNEYS

### 1. 3D Narrative Scroll Experience
- **Scroll Orchestration:** Smooth WebGL canvas camera transitions scrubbing through the 8-stage narrative timeline:  
  `NEED` → `REPORT` → `VERIFY` → `CONNECT` → `HELP` → `PROVE` → `IMPACT` → `HUMANITY`
- **Organic Physical Materials:** Sculpted clay hands, paper document mesh, ceramic nodes, physical threads, floating shards, and unified 3D sculpture ("DIFFERENT PEOPLE. ONE HUMANITY.").
- **Accessibility:** `prefers-reduced-motion` CSS rules disabling 3D camera animations and rendering static cross-fading editorial renders.

### 2. AI Mission Copilot (`/report`, `/api/v1/missions/[publicId]/copilot`)
- Converts raw, unstructured text descriptions into structured fields:
  - Title & Summary
  - Category (*Food Support, Education, Healthcare Support, Infrastructure, Emergency Assistance, Elder Support, Accessibility, Environmental Cleanup, Community Resources*)
  - Urgency Level (*LOW, MEDIUM, HIGH, CRITICAL*)
  - Resource & Volunteer Requirements
  - Affected People Count

### 3. AI Evidence Verification & Human Review Pipeline (`/api/v1/missions/[publicId]/submit`)
- **Stage 1 (File Integrity):** Validates MIME type signature and payload constraints (< 25MB).
- **Stage 2 (SHA-256 Hashing):** Compares cryptographic hashes against global records to catch duplicate evidence reuse.
- **Stage 3 (EXIF Analysis):** Checks EXIF timestamps, camera model, and GPS coordinates.
- **Stage 4 (Risk Signal Aggregation):** Calculates explainable confidence bands (`LOW_RISK`, `MEDIUM_RISK`, `HIGH_RISK`, `INSUFFICIENT_EVIDENCE`). High-risk or high-value cases are automatically routed to the Human Verifier Queue.

### 4. Humanity Radar & Helper Network (`/radar`, `/api/v1/helper/missions`)
- Location-based topographic discovery map.
- **Matching Engine:** Ranks missions for Helpers using Haversine distance, required skill overlap, and urgency weight.
- **Helper State Machine:** `AVAILABLE` → `ACCEPTED` → `IN_PROGRESS` → `PROOF_SUBMITTED` → `COMPLETED`.

### 5. Proof of Work & Success Gallery (`/api/v1/missions/[publicId]/proof`, `/api/v1/proof/[id]/review`)
- Helpers submit verified "Before & After" photos and completion notes.
- Verifier/Admin review changes mission state to `COMPLETED` and awards **+50 Humanity Points** to the Helper.

### 6. Transparent Fundraising & Financial Ledger (`/api/v1/missions/[publicId]/donations/order`, `/api/v1/payments/webhook`)
- Razorpay order creation modal with preset/custom donation amounts.
- Webhook signature validation updating mission `fundingRaised` and inserting append-only `LedgerEntry` records (`CREDIT_DONATION` and `PLATFORM_FEE`).

### 7. TrustGraph & Humanity Passport (`/passport`, `/api/v1/missions/[publicId]/trustgraph`)
- **TrustGraph:** Auditable event chain timeline generated from real `AuditEvent` database records.
- **Humanity Passport:** Verified user contribution ledger tracking total Humanity Points, completed missions, communities helped, verified proofs, and verified humanitarian badges.

### 8. CSR Command Center (`/csr`, `/api/v1/csr/campaigns/[id]/report`)
- Corporate CSR campaign creation and branded impact pages (`/csr/[slug]`).
- Instant **CSV Impact Audit Report Generation** containing total deployed funding, verified completed missions, and direct beneficiary metrics.

### 9. Operations Admin Portal (`/admin`, `/api/v1/admin/*`)
- **Verification Queue:** Inspect and approve/reject pending mission reports.
- **Proof Queue:** Inspect submitted proof of work and award reputation points.
- **User Moderation:** View user database, check points, and toggle account status (`ACTIVE` / `SUSPENDED`).
- **Financial Ledger Audit:** Monitor total raised, platform fees, and net impact disbursements.
- **Audit Logs:** Inspect immutable system-wide event logs.
- **1-Click Database Seeder:** Populate test accounts and demo missions.

---

## 📡 5. REST API SPECIFICATION (`/api/v1/...`)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Public | System health and database connectivity check |
| `/api/v1/seed` | `POST` | Public | Populates development seed accounts and demo missions |
| `/api/v1/auth/register` | `POST` | Public | Registers a new account and returns JWT session cookie |
| `/api/v1/auth/login` | `POST` | Public | Authenticates user and returns JWT session cookie |
| `/api/v1/auth/logout` | `POST` | Public | Clears session cookie |
| `/api/v1/auth/me` | `GET` | Authenticated | Returns current authenticated user profile |
| `/api/v1/users/me/passport` | `GET` | Authenticated | Fetches user's Humanity Passport and contribution history |
| `/api/v1/missions` | `POST` | Seeker/Admin | Creates a new mission report (`DRAFT`) |
| `/api/v1/missions` | `GET` | Public | Lists verified missions with category/urgency/status filters |
| `/api/v1/missions/[publicId]` | `GET` | Public | Fetches mission details |
| `/api/v1/missions/[publicId]/copilot` | `POST` | Public | AI Mission Copilot unstructured text parsing |
| `/api/v1/missions/[publicId]/submit` | `POST` | Seeker/Admin | Submits report and triggers AI Verification Pipeline |
| `/api/v1/missions/[publicId]/accept` | `POST` | Helper/Admin | Helper accepts mission (`ASSIGNED`) |
| `/api/v1/missions/[publicId]/start` | `POST` | Helper/Admin | Helper starts work (`IN_PROGRESS`) |
| `/api/v1/missions/[publicId]/withdraw` | `POST` | Helper/Admin | Helper withdraws (`PUBLISHED`) |
| `/api/v1/missions/[publicId]/proof` | `POST` | Helper/Seeker | Submits proof of work evidence (`PROOF_SUBMITTED`) |
| `/api/v1/missions/[publicId]/verification` | `GET` | Public | Fetches mission verification risk signals |
| `/api/v1/missions/[publicId]/donations/order` | `POST` | Authenticated | Creates Razorpay donation order |
| `/api/v1/missions/[publicId]/trustgraph` | `GET` | Public | Fetches auditable TrustGraph event chain |
| `/api/v1/verification/[missionId]/review` | `POST` | Verifier/Admin | Approves or rejects pending mission verification |
| `/api/v1/proof/[id]/review` | `POST` | Verifier/Admin | Approves proof of work and awards +50 Humanity Points |
| `/api/v1/helper/missions` | `GET` | Helper/Admin | Returns personalized mission matching scores |
| `/api/v1/payments/webhook` | `POST` | Public | Razorpay webhook signature verification & ledger entry |
| `/api/v1/csr/organizations` | `POST/GET`| CSR/Admin | Manages CSR corporate profile |
| `/api/v1/csr/campaigns` | `POST/GET`| CSR/Admin | Manages corporate impact campaigns |
| `/api/v1/csr/campaigns/[id]/report` | `GET` | CSR/Admin | Generates downloadable CSV impact audit report |
| `/api/v1/disputes` | `POST/GET`| Authenticated | Opens or views moderation disputes |
| `/api/v1/admin/users` | `POST/GET`| Admin | User moderation and account suspension toggle |
| `/api/v1/admin/reviews` | `GET` | Verifier/Admin | Pending verification and proof review queues |
| `/api/v1/admin/payments` | `GET` | Admin | Financial accounting ledger inspection |
| `/api/v1/admin/audit-events` | `GET` | Admin | Immutable audit log viewer |

---

## 🚀 6. LOCAL SETUP & ENVIRONMENT VARIABLES

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env.local`)
Create `.env.local` using the template below:

```ini
NODE_ENV=development

APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api/v1

# MongoDB Connection String (Atlas or Local)
DATABASE_URL=mongodb://127.0.0.1:27017/way2humanity

# Authentication Secrets
AUTH_SECRET=way2humanity_production_auth_secret_key_32chars
JWT_ACCESS_SECRET=way2humanity_jwt_access_secret_key_32chars
JWT_REFRESH_SECRET=way2humanity_jwt_refresh_secret_key_32chars

# AI Verification Provider Configuration
AI_PROVIDER=gemini
AI_PROVIDER_API_KEY=your_gemini_api_key_here

# Payment Provider Configuration (Razorpay)
PAYMENT_PROVIDER=razorpay
PAYMENT_KEY_ID=rzp_test_way2humanity_key
PAYMENT_KEY_SECRET=rzp_test_way2humanity_secret
PAYMENT_WEBHOOK_SECRET=rzp_whsec_way2humanity_webhook_secret
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Seed Development Database
Click **"Seed Development Data"** in the [/admin](http://localhost:3000/admin) portal or run:
```bash
curl -X POST http://localhost:3000/api/v1/seed
```

#### Seed Test Accounts (Password: `password123`):
- **Seeker:** `seeker@example.test`
- **Helper:** `helper@example.test`
- **Donor:** `donor@example.test`
- **Verifier:** `verifier@example.test`
- **CSR Organization:** `csr@example.test`
- **Admin:** `admin@example.test`

---

## 🧪 7. TESTING & VERIFICATION

Run the automated verification suite:

```bash
npm test
```

### Tested Logic:
- Mission state machine valid & invalid status transitions
- Helper mission Haversine distance calculation
- Razorpay HMAC SHA-256 webhook signature verification
- Server-side RBAC role permissions
- AI risk signal aggregation scoring

---

## 🛡️ 8. SECURITY & PRODUCTION GUIDELINES

1. **Server-Side Authorization:** Every protected endpoint validates authentication tokens and RBAC roles on the server. Never trust client-side role assertions.
2. **Webhook Verification:** Payment updates are processed strictly via signed provider webhooks with HMAC SHA-256 validation.
3. **Immutable Ledger:** Financial transactions and audit events use append-only records to prevent retrospective manipulation.
4. **Data Privacy:** Public maps display approximate coordinates to protect beneficiary privacy.

---

## 📜 9. LICENSE & COPYRIGHT

© 2026 Way2Humanity Foundation. All rights reserved.  
*“Growing Humanity Through Technology”*
