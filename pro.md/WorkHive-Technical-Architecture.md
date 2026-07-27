# Technical Architecture Document: WorkHive

**Status:** Draft v1.0
**Owner:** Engineering
**Last updated:** July 19, 2026
**Companion docs:** WorkHive-Project-Plan-Enhanced.md (build sequencing), WorkHive-PRD.md (product scope)

---

## 1. Architecture at a glance

WorkHive is a two-sided marketplace with one property that dominates every technical decision below: **money and hiring state must never end up inconsistent, even under concurrent requests.** That single requirement is why this document leans conservative — a relational database with real transactions, a proven ORM, and a lock strategy that's boring and provable, rather than anything trendy.

```
┌─────────────┐      HTTPS/REST       ┌──────────────┐      SQL       ┌────────────┐
│   Frontend   │ ───────────────────▶ │   Backend    │ ─────────────▶ │ PostgreSQL │
│ React + Vite │ ◀─────────────────── │ Node/Express │ ◀───────────── │  (primary  │
│  (Vercel)    │      WebSocket        │  (Railway)   │                │   store)   │
└─────────────┘ ◀──────────────────── └──────┬───────┘                └────────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                    ┌───────────┐      ┌─────────────┐     ┌─────────────┐
                    │   Redis    │      │  BullMQ      │     │  Razorpay    │
                    │ (cache +   │      │  (job queue: │     │  (payment    │
                    │  pub/sub)  │      │  payments,   │     │   gateway)   │
                    └───────────┘      │  emails, DLQ)│     └─────────────┘
                                        └─────────────┘
```

Two independently deployed services (frontend, backend), one primary database, Redis as the only other stateful dependency. Nothing in this stack requires more than a single engineer to operate.

---

## 2. Recommended tech stack, with reasoning

### 2.1 Frontend

| Choice | Reasoning |
|---|---|
| **React 18 + TypeScript** | The team already has React context from the project plan; TypeScript is non-negotiable on a project with money fields — a `number` vs `string` mismatch on a paise amount is exactly the class of bug that's cheap to catch at compile time and expensive to catch in production. |
| **Vite** | Faster dev server and build than CRA/webpack for a project this size; no reason to reach for Next.js here since there's no SEO requirement on the dashboard-heavy parts of the app and the home page alone doesn't justify SSR complexity. |
| **TanStack Query (React Query)** | Every screen in WorkHive is "fetch server state, mutate it, refetch" — jobs, proposals, wallet balance. TanStack Query removes the need for hand-rolled loading/error/cache state for each of these and plays well with the WebSocket-driven invalidations in Phase 2. |
| **Tailwind CSS** | Fast to build consistent dashboard UI (badges, cards, tables) without a component library dependency; keeps bundle size predictable. |
| **Socket.io-client** | Pairs with the backend's Socket.io server for `job:posted`, `proposal:submitted`, `payment:released` events — see Section 2.2. |
| **React Hook Form + Zod** | Forms with real validation stakes (job budget, bid amount) — Zod schemas can be shared between frontend validation and backend request validation, so the "what's a valid job" rule is defined once. |

### 2.2 Backend

| Choice | Reasoning |
|---|---|
| **Node.js + Express, TypeScript** | Express over Fastify/NestJS: this is a solo/small-team project where Express's low ceremony and huge ecosystem outweigh NestJS's structure benefits, which pay off more at larger team sizes. TypeScript for the same reason as frontend — money and status fields need compile-time safety. |
| **PostgreSQL** | The hire-lock and escrow logic *require* real transactions and row-level locking (`SELECT ... FOR UPDATE`). This single requirement rules out most NoSQL stores outright — this is not a "pick Postgres by default" choice, it's a "nothing else safely does this" choice. |
| **Prisma ORM** | Type-safe query results that match the TypeScript models exactly (no drift between DB schema and application types), first-class migration tooling, and — importantly — Prisma's `$transaction` API makes the hire-lock's "lock row, check status, update, commit" sequence explicit and readable instead of buried in raw SQL string templates. |
| **Redis (via ioredis)** | Two separate jobs: (1) cache-aside for the job search/listing endpoint, (2) pub/sub backbone so WebSocket events work correctly once the backend scales beyond one instance. |
| **BullMQ** | Redis-backed job queue for anything that shouldn't block the HTTP response: payment release retries, email notifications, the dead-letter queue for failed payment operations. |
| **Socket.io** | Real-time events for both dashboards (new proposal arrived, you've been hired, payment released) — chosen over raw WebSockets for its automatic reconnection and room support (one room per user, trivial to target events). |
| **JWT (access + refresh token pair)** | Stateless auth that scales horizontally without a session store; short-lived access token (15 min) + longer-lived refresh token (7 days) stored as an httpOnly cookie, standard mitigation against XSS token theft. |
| **Razorpay** | India-first gateway with a full test-mode sandbox (no live KYC needed to build against), native UPI support, and INR as a first-class currency rather than a converted one. |
| **Zod** | Request body validation on every mutating endpoint — shared schema definitions with the frontend forms (Section 2.1). |

### 2.3 Infrastructure

| Choice | Reasoning |
|---|---|
| **Frontend → Vercel** | Zero-config static/SPA hosting, free tier is generous, instant preview deploys per PR. |
| **Backend → Railway (or Render)** | Both give you a managed Postgres instance, a managed Redis instance, and a long-running Node process (unlike Vercel's serverless functions, which are a poor fit for a persistent Socket.io connection) — pick whichever has the friendlier free-tier Redis add-on at signup time. |
| **PostgreSQL → managed instance on the same platform as the backend** | Co-locating DB and API reduces latency for the row-locking transaction path, which is the most latency-sensitive part of the app. |
| **Redis → managed instance on the same platform** | Same co-location reasoning. |
| **GitHub Actions** | Lint + typecheck + test on every PR; this is cheap to set up and catches the "someone changed a Prisma type and didn't update a consumer" class of bug before merge. |

---

## 3. File and folder structure

Two top-level apps in one repo (a lightweight monorepo, not a full Nx/Turborepo setup — that tooling earns its complexity at a team size WorkHive doesn't have yet).

```
workhive/
├── apps/
│   ├── web/                          # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   └── Signup.tsx
│   │   │   │   ├── creator/
│   │   │   │   │   ├── CreatorDashboard.tsx
│   │   │   │   │   ├── PostJob.tsx
│   │   │   │   │   ├── MyJobs.tsx
│   │   │   │   │   └── Payments.tsx
│   │   │   │   └── worker/
│   │   │   │       ├── WorkerDashboard.tsx
│   │   │   │       ├── BrowseJobs.tsx
│   │   │   │       ├── MyProposals.tsx
│   │   │   │       ├── MyContracts.tsx
│   │   │   │       └── Earnings.tsx
│   │   │   ├── components/           # Shared UI: JobCard, ProposalRow, WalletBadge, StatusPill...
│   │   │   ├── hooks/                 # useJobs, useProposals, useWallet, useSocket
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts      # thin fetch wrapper, attaches auth header
│   │   │   │   ├── socket.ts          # Socket.io client singleton
│   │   │   │   └── schemas.ts         # Zod schemas shared in spirit with backend
│   │   │   ├── context/               # AuthContext (current user, role)
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                          # Backend (Node + Express)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── jobs.routes.ts
│       │   │   ├── proposals.routes.ts
│       │   │   ├── payments.routes.ts
│       │   │   └── reviews.routes.ts
│       │   ├── controllers/           # one per route file, thin — validate input, call service, respond
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── job.service.ts
│       │   │   ├── proposal.service.ts
│       │   │   ├── hire.service.ts     # the hire-lock transaction lives here, isolated
│       │   │   ├── escrow.service.ts   # fund/release/refund, idempotency handling
│       │   │   └── notification.service.ts
│       │   ├── jobs/                   # BullMQ processors
│       │   │   ├── payment-retry.processor.ts
│       │   │   └── email.processor.ts
│       │   ├── sockets/
│       │   │   └── index.ts            # Socket.io server setup, room join on auth
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts  # verifies JWT, attaches req.user
│       │   │   ├── rbac.middleware.ts  # requireRole('client' | 'freelancer')
│       │   │   ├── rate-limit.middleware.ts
│       │   │   └── error-handler.middleware.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts           # Prisma client singleton
│       │   │   ├── redis.ts            # ioredis client singleton
│       │   │   └── razorpay.ts         # Razorpay SDK client
│       │   ├── validators/             # Zod schemas per endpoint
│       │   ├── app.ts                  # Express app assembly, middleware wiring
│       │   └── server.ts               # entrypoint — starts HTTP + Socket.io
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/            # hire-lock concurrency test lives here
│       └── package.json
│
├── packages/
│   └── shared/                        # Types/Zod schemas genuinely shared between web and api
│       └── src/
│           ├── types.ts                # Job, Proposal, User, Payment TS types
│           └── schemas.ts              # Zod schemas for request/response shapes
│
├── docker-compose.yml                  # Postgres + Redis for local dev
├── .github/workflows/ci.yml
├── .env.example
└── README.md
```

**Why `services/` is separated from `controllers/`:** the hire-lock and escrow logic is the part of this codebase most likely to be asked about in review or an interview — keeping it in a dedicated, controller-agnostic service file means it can be unit-tested and concurrency-tested (Section 5) without spinning up HTTP at all.

---

## 4. Database schema

PostgreSQL. All money fields are `bigint`, storing **paise** (₹1 = 100 paise) — never `float`/`numeric`, for the same reason Stripe stores cents: float arithmetic silently produces values like ₹449.999999998 after a few operations.

### 4.1 `users`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `email` | text, unique | Login identity |
| `password_hash` | text | bcrypt/argon2 hash, never plaintext |
| `role` | enum(`client`, `freelancer`) | Fixed at signup — determines dashboard routing |
| `name` | text | |
| `headline` | text, nullable | Worker-only, e.g. "React Developer" |
| `skills` | text[] | Worker-only; used for job search filters |
| `wallet_balance_paise` | bigint, default 0 | The user's spendable/withdrawable balance |
| `rating_avg` | numeric(3,2), nullable | Denormalized average of reviews received, recalculated on new review |
| `created_at` | timestamptz | |

**Plain English:** one table for both roles rather than separate `clients` and `freelancers` tables — the `role` column is the fork point, and the handful of role-specific fields (`headline`, `skills`) are simply nullable for the role that doesn't use them. This avoids a join on every auth check just to know who someone is.

### 4.2 `jobs`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `client_id` | uuid, FK → `users.id` | The Creator who posted it |
| `title` | text | |
| `description` | text | |
| `budget_paise` | bigint | Creator's stated budget — advisory; the actual agreed amount is set on hire |
| `skills_required` | text[] | |
| `deadline` | date, nullable | |
| `status` | enum(`draft`, `posted`, `assigned`, `escrowed`, `submitted`, `paid`, `cancelled`) | The single source of truth for where a job is in its lifecycle |
| `freelancer_id` | uuid, FK → `users.id`, nullable | Set only once a proposal is accepted |
| `agreed_amount_paise` | bigint, nullable | The accepted proposal's bid amount — set on hire, this (not `budget_paise`) is what actually gets escrowed |
| `delivery_note` | text, nullable | Worker's submission note/link |
| `hired_at`, `escrowed_at`, `submitted_at`, `paid_at` | timestamptz, nullable | Timestamps for each lifecycle transition — used for the "time from X to Y" success metrics in the PRD |
| `created_at` | timestamptz | |

**Plain English:** a job's status column is what everything else in the system reads to decide what actions are legal (you can't fund escrow on a job that isn't `assigned`, you can't release payment on a job that isn't `submitted`). This is why the hire-lock transaction (Section 5) always re-checks `status` inside the lock rather than trusting what the frontend last showed.

### 4.3 `proposals`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `job_id` | uuid, FK → `jobs.id` | |
| `freelancer_id` | uuid, FK → `users.id` | |
| `amount_paise` | bigint | The Worker's bid — becomes `jobs.agreed_amount_paise` if accepted |
| `message` | text | The pitch |
| `status` | enum(`pending`, `accepted`, `rejected`, `withdrawn`) | |
| `created_at` | timestamptz | |

**Relationship:** many proposals per job (one per Worker who pitches), one proposal per (job, freelancer) pair — enforce with a unique constraint on `(job_id, freelancer_id)` so a Worker can't spam multiple pitches on the same job.

### 4.4 `payments`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `job_id` | uuid, FK → `jobs.id` | |
| `type` | enum(`escrow`, `release`, `refund`) | Which leg of the money flow this record represents |
| `amount_paise` | bigint | |
| `platform_fee_paise` | bigint, nullable | Only set on `release` records |
| `idempotency_key` | text, unique | Prevents double-processing on retried requests — see Section 5.2 |
| `gateway_ref` | text, nullable | Razorpay's transaction/order ID, for reconciliation |
| `status` | enum(`pending`, `succeeded`, `failed`) | |
| `created_at` | timestamptz | |

**Plain English:** this table is the ledger. `jobs.status` tells you where a job *is*; `payments` tells you *how it got there* — every ₹ that moved, in which direction, and whether the gateway confirmed it. This separation matters for auditability: if `jobs.status` and `payments` ever disagree, `payments` is the source of truth for what actually happened financially.

### 4.5 `reviews`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `job_id` | uuid, FK → `jobs.id` | |
| `reviewer_id` | uuid, FK → `users.id` | Who wrote it |
| `reviewee_id` | uuid, FK → `users.id` | Who it's about |
| `rating` | smallint (1-5) | |
| `comment` | text, nullable | |
| `created_at` | timestamptz | |

**Relationship:** exactly two reviews per completed job (Creator → Worker, Worker → Creator), enforced with a unique constraint on `(job_id, reviewer_id)`.

### 4.6 `audit_log`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `actor_id` | uuid, FK → `users.id` | Who did it |
| `action` | text | e.g. `job.hired`, `escrow.funded`, `payment.released` |
| `entity_type` | text | e.g. `job`, `proposal`, `payment` |
| `entity_id` | uuid | Polymorphic reference — not a strict FK, since it can point at multiple tables |
| `metadata` | jsonb | Free-form context (old status, new status, amount, etc.) |
| `created_at` | timestamptz | |

**Plain English:** this is the "what actually happened, in order" table — every state-changing action writes one row here regardless of which table it touched. It's what you'd pull up to answer "why does this job say `paid` but the Worker says they never got the money" — a real support/debugging need, not a nice-to-have.

### 4.7 Relationships, summarized

- One `user` (Creator) → many `jobs`
- One `user` (Worker) → many `proposals`
- One `job` → many `proposals`, but → at most one *accepted* proposal (enforced in application logic inside the hire-lock transaction, not just a DB constraint, because "at most one accepted" needs to also flip the others to `rejected` atomically)
- One `job` → many `payments` (typically one `escrow` and one `release`, plus a `refund` on the disputed/cancelled path)
- One `job` → exactly two `reviews` once completed
- Every state-changing action → one `audit_log` row

---

## 5. The two things that need extra care

### 5.1 The hire-lock (preventing double-hiring)

Inside a single Prisma `$transaction`:
1. `SELECT ... FOR UPDATE` the `jobs` row by `id` — this blocks any other concurrent transaction trying to hire on the same job until this one commits or rolls back.
2. Re-check `status === 'posted'` *inside* the lock, not before it — the check-then-act has to happen after the lock is held, or two requests can both pass the check before either writes.
3. If not `posted`, roll back and return a "this job is no longer open" error.
4. If `posted`: update the job to `assigned` with the chosen `freelancer_id` and `agreed_amount_paise`; update the accepted proposal to `accepted`; update every other proposal on that job to `rejected`; write an `audit_log` row. Commit.

The integration test for this fires N concurrent "accept" requests against the same job and asserts exactly one succeeds — this is the test worth having actual CI coverage on, not just manual verification.

### 5.2 Idempotent payment operations

Every "fund escrow" and "release payment" request from the frontend generates a UUID client-side and sends it as the idempotency key. The backend:
1. Checks `payments` for an existing row with that `idempotency_key`.
2. If found, returns the *original* result instead of processing again (handles double-clicks and network retries without double-charging or double-paying).
3. If not found, proceeds, calls Razorpay, and writes the `payments` row with `status = 'pending'` before the gateway call, updating to `succeeded`/`failed` after — so even a crash mid-call leaves a recoverable `pending` record rather than silence.

---

## 6. Environment variables and configuration notes

### 6.1 Backend (`apps/api/.env`)

```bash
# Server
NODE_ENV=development                 # development | production
PORT=4000
FRONTEND_URL=http://localhost:5173    # used for CORS + email links

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/workhive

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=                    # generate with `openssl rand -hex 32`
JWT_REFRESH_SECRET=                   # a DIFFERENT secret from the access one
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Payments (Razorpay test mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=              # separate secret for verifying webhook signatures

# Platform economics
PLATFORM_FEE_PERCENT=10               # keep configurable, not hardcoded in escrow.service.ts

# Email (Phase 2+, optional at MVP)
RESEND_API_KEY=

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6.2 Frontend (`apps/web/.env`)

```bash
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=                 # public key only — never the secret, this is client-exposed
```

### 6.3 Configuration notes before you start building

- **Never commit `.env` files.** Commit `.env.example` with keys but no values; each engineer and each deploy environment (Railway/Vercel dashboards) holds its own real values.
- **Two different JWT secrets, not one reused for access and refresh.** If the access secret ever leaks (e.g. logged by accident), the refresh token — the longer-lived, more damaging one — stays safe.
- **All money math happens server-side, in integer paise, using `bigint`.** The frontend only ever formats a paise value for display (`₹${(paise / 100).toLocaleString('en-IN')}`) — it never computes a fee or total that the backend doesn't independently verify.
- **`PLATFORM_FEE_PERCENT` is an env var, not a constant in code**, specifically so it can be changed without a deploy — pricing is a business decision, not an engineering one.
- **Store all timestamps in UTC (`timestamptz`)**, format to IST only at the display layer — don't let "deadline" ambiguity creep in from mixing naive and timezone-aware dates.
- **Razorpay webhook signature verification is mandatory**, not optional — a payment status update must never be trusted from an unverified webhook call, or anyone who finds the endpoint URL could fake a "payment succeeded" event.
- **Local dev uses `docker-compose.yml`** to spin up Postgres + Redis with one command (`docker compose up -d`) — nobody should need to install Postgres natively to start contributing.
- **Prisma migrations, not manual SQL**, for every schema change — `npx prisma migrate dev` locally, `npx prisma migrate deploy` in CI/production, so the schema in every environment is provably derived from the same migration history.
- **Seed script (`prisma/seed.ts`)** should create a handful of test Creators, Workers, and jobs in a few different lifecycle states (`posted`, `assigned`, `escrowed`) — this is what lets a new engineer or reviewer see the whole app working without manually walking every job through its lifecycle by hand.
