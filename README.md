<div align="center">

# 🐝 WorkHive

**A two-sided freelance marketplace for the Indian market — INR-native, escrow-first, built for trust.**

Connecting **Creators** (people who need work done) with **Workers** (freelancers who do it) — with money that's never at risk mid-transaction.

[![Status](https://img.shields.io/badge/status-MVP%20in%20development-E8A33D)](#roadmap)
[![Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20React%20%7C%20Node%20%7C%20PostgreSQL-1B1F23)](#tech-stack)
[![License](https://img.shields.io/badge/license-TBD-4A5560)](#license)

</div>

---

## Table of contents

- [What is WorkHive](#what-is-workhive)
- [The core promise](#the-core-promise)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Database schema](#database-schema)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Test accounts](#test-accounts)
- [Security model](#security-model)
- [Design system](#design-system)
- [Roadmap](#roadmap)
- [Documentation](#documentation)

---

## What is WorkHive

Hiring a freelancer off WhatsApp groups or Instagram DMs means no accountability if the work is late, wrong, or never delivered. Existing global platforms (Upwork, Fiverr) are built around USD and fee structures tuned for a US/EU audience.

WorkHive solves this with a **pitch-driven, escrow-backed marketplace built entirely around ₹ (INR)**:

1. A **Creator** posts a job with a clear scope and budget.
2. **Workers** pitch for it with a bid and message.
3. The Creator hires exactly one Worker — every other pitch is automatically closed out.
4. The Creator funds **escrow** — money is locked by the platform, not sent directly.
5. The Worker delivers the work.
6. The Creator reviews and **releases payment** — funds move to the Worker, minus a transparent platform fee.

## The core promise

> **Your money or your work is never at risk mid-transaction.**

- A Creator's money is charged once and held until *they* approve the work.
- A Worker never has to start real work until payment is provably locked in.
- Nobody can be double-hired for the same job — ever, even under concurrent requests.

## How it works

<table>
<tr>
<th>👤 Creator flow</th>
<th>🧑‍💻 Worker flow</th>
</tr>
<tr>
<td valign="top">

1. Post a job (title, description, ₹ budget, deadline, skills)
2. Review incoming pitches
3. **Hire** one Worker — all others auto-decline
4. **Fund escrow** — ₹ deducted from wallet, held by platform
5. Wait for delivery
6. Review work → **Release payment** (fee shown up front)
7. Leave a review

</td>
<td valign="top">

1. Browse/search open jobs by skill or budget
2. **Send a pitch** — bid amount + message
3. Track pitch status (pending / accepted / rejected)
4. Get hired → wait for escrow to be funded
5. Begin work once escrow is confirmed
6. **Submit delivery** with a note/link
7. Get paid → withdraw earnings → leave a review

</td>
</tr>
</table>

**Status lifecycle:**

```
draft → posted → assigned → escrowed → submitted → paid
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Fast dev/build, no SSR needed for a dashboard-heavy app |
| **State/data** | TanStack Query, React Hook Form + Zod | Server-state caching; shared validation schemas with the backend |
| **Styling** | Tailwind CSS | Fast, consistent dashboard UI without a heavy component library |
| **Backend** | Node.js + Express + TypeScript | Low ceremony, right-sized for a small team |
| **Database** | PostgreSQL + Prisma ORM | Real transactions and row-level locking — required for safe hire/escrow logic |
| **Cache / queue** | Redis (ioredis) + BullMQ | Cache-aside job search, background jobs, retries, dead-letter queue |
| **Real-time** | Socket.io | Live proposal/hire/payment events per user |
| **Auth** | JWT (short-lived access + long-lived refresh) | Stateless, horizontally scalable, standard XSS mitigation via httpOnly cookie |
| **Payments** | Razorpay (Orders API) + RazorpayX (Payouts API) | India-first gateway, native UPI, INR as a first-class currency |
| **Email** | Resend | Transactional email, queued so a slow provider never blocks core actions |
| **Hosting** | Vercel (frontend) · Railway/Render (backend + managed Postgres/Redis) | Zero-config deploys, generous free tiers, co-located DB for low-latency locking |

All money is stored and calculated **server-side as `bigint` paise** (₹1 = 100 paise) — never `float` — for the same reason Stripe stores cents.

## Architecture

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

Two independently deployed services, one primary database, Redis as the only other stateful dependency — nothing here requires more than a single engineer to operate.

**The two things engineered with extra care:**

- **The hire-lock** — inside a single Prisma transaction, the job row is locked (`SELECT ... FOR UPDATE`), its status is re-checked *inside* the lock, and only then is one proposal accepted and the rest rejected. A concurrency test fires 20 simultaneous "accept" requests at the same job and asserts exactly one succeeds.
- **Idempotent payments** — every escrow-funding and payment-release request carries a client-generated idempotency key, so double-clicks or network retries can never double-charge or double-pay.

## Database schema

| Table | Purpose |
|---|---|
| `users` | One table for both roles; `role` (`client` \| `freelancer`) is the fork point |
| `jobs` | The source of truth for a job's lifecycle status |
| `proposals` | One pitch per (job, freelancer) pair, enforced with a unique constraint |
| `payments` | The ledger — every ₹ moved, in which direction, gateway-confirmed or not |
| `reviews` | Exactly two reviews per completed job, enforced with a unique constraint |
| `audit_log` | Every state-changing action, for support/debugging and future admin tooling |

All money columns are `bigint`, storing **paise**. Full field-level schema lives in [`WorkHive-Technical-Architecture.md`](./WorkHive-Technical-Architecture.md).

## Project structure

```
workhive/
├── apps/
│   ├── web/                # Frontend — React + Vite + TypeScript
│   │   └── src/
│   │       ├── pages/       # Home, Auth, creator/*, worker/*
│   │       ├── components/  # JobCard, ProposalRow, WalletBadge, StatusPill...
│   │       ├── hooks/       # useJobs, useProposals, useWallet, useSocket
│   │       ├── lib/         # api-client, socket, shared schemas
│   │       └── context/     # AuthContext
│   │
│   └── api/                 # Backend — Node + Express + TypeScript
│       └── src/
│           ├── routes/       # auth, jobs, proposals, payments, reviews
│           ├── controllers/  # thin — validate, call service, respond
│           ├── services/     # hire.service.ts, escrow.service.ts, ...
│           ├── jobs/          # BullMQ processors (payment retry, email)
│           ├── sockets/       # Socket.io server setup
│           ├── middleware/    # auth, rbac, rate-limit, error-handler
│           └── lib/           # prisma, redis, razorpay clients
│
├── packages/
│   └── shared/               # TS types + Zod schemas shared by web and api
│
├── docker-compose.yml         # Postgres + Redis for local dev
└── .github/workflows/ci.yml   # Lint + typecheck + test on every PR
```

## Getting started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example apps/api/.env
cp .env.example apps/web/.env
# Edit both .env files with your values

# 4. Run database migrations + seed
pnpm db:migrate
pnpm db:seed

# 5. Start both apps
pnpm dev
```

| Service | URL |
|---|---|
| API | http://localhost:4000 |
| Web | http://localhost:5173 |
| DB Studio | `pnpm db:studio` |

## Environment variables

Both `apps/web/.env` and `apps/api/.env` are copied from `.env.example` — never commit real values. Key variables:

```bash
# API
DATABASE_URL=postgresql://user:pass@localhost:5432/workhive
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=            # openssl rand -hex 32
JWT_REFRESH_SECRET=           # a DIFFERENT secret from the access one
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
PLATFORM_FEE_PERCENT=10

# Web
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=          # public key only — never the secret
```

Full list with reasoning in [`WorkHive-Technical-Architecture.md`](./WorkHive-Technical-Architecture.md#6-environment-variables-and-configuration-notes).

## Test accounts

After running `pnpm db:seed`:

| Email | Password | Role |
|---|---|---|
| creator1@test.com | Test@1234 | Client |
| creator2@test.com | Test@1234 | Client |
| worker1@test.com | Test@1234 | Freelancer |
| worker2@test.com | Test@1234 | Freelancer |
| worker3@test.com | Test@1234 | Freelancer |

Seeded jobs span every lifecycle status (`posted`, `assigned`, `escrowed`, `paid`) so the whole loop is visible without manually walking a job through it by hand.

## Security model

> A user should only ever see or touch data that belongs to them, and money should only ever move when both sides have taken a real, deliberate action — never automatically, never by accident, never twice.

- **Auth:** email + password, JWT access (15 min) + refresh (7 days, httpOnly cookie), bcrypt/argon2 password hashing.
- **RBAC:** two roles at launch — Creator and Worker — each scoped to their own jobs, proposals, payments, and wallet.
- **Row-level security:** enforced at both the application layer *and* as real PostgreSQL RLS policies, so a missing filter in application code can never leak another user's data.
- **Payments:** Razorpay webhook signatures are always verified server-side before a payment event is trusted; the frontend never calculates or sends fee amounts — the backend is the sole source of truth.
- **Error handling:** generic, non-information-leaking messages on permission failures (a job that isn't yours looks the same whether it exists or not).

Full detail in [`WorkHive-Security-and-Access.md`](./WorkHive-Security-and-Access.md).

## Design system

WorkHive's visual identity is **a working ledger, not a marketing template** — precise and transparent, with a restrained hex/hive motif rather than decorative flourishes.

| Token | Use |
|---|---|
| `--color-amber` `#E8A33D` | Primary accent — buttons, active states |
| `--color-wheat` `#FBF3E3` | Page background |
| `--color-ink` `#1B1F23` | Primary text |
| `--color-signal-green` / `--color-alert-rust` / `--color-info-blue` | Status colors (paid/rejected/pending) |

- **Display type:** Space Grotesk (home page only)
- **UI/body:** Inter
- **Money/numeric:** JetBrains Mono — fixed-width digits so ₹ amounts align in tables

Full tokens, component specs, and accessibility baseline in [`WorkHive-Frontend-Specification.md`](./WorkHive-Frontend-Specification.md).

## Roadmap

| Phase | Scope |
|---|---|
| ✅ **MVP (v1)** | Auth, job posting, pitching, single-hire guarantee, escrow, delivery, payment release, reviews |
| 🟡 **Fast-follow** | In-app messaging, saved jobs/searches, Worker portfolios, notification center, milestone payments |
| ⚪ **Later** | Sliding platform fee, multiple withdrawal methods, KYC/ID verification, dispute resolution + admin console, hourly contracts |

**Explicitly not in v1:** hourly/time-tracked work, international payments, a full dispute/admin system, a mobile app. See [`WorkHive-PRD.md`](./WorkHive-PRD.md#8-explicitly-not-building-in-v1) for the full reasoning.

## Documentation

| Doc | Covers |
|---|---|
| [`WorkHive-PRD.md`](./WorkHive-PRD.md) | Problem statement, personas, MVP scope, success metrics |
| [`WorkHive-Technical-Architecture.md`](./WorkHive-Technical-Architecture.md) | Stack, folder structure, schema, hire-lock & idempotency design |
| [`WorkHive-Security-and-Access.md`](./WorkHive-Security-and-Access.md) | Auth, roles, row-level security, error handling, edge cases |
| [`WorkHive-Frontend-Specification.md`](./WorkHive-Frontend-Specification.md) | Design tokens, components, Razorpay/Resend integration details |
| [`WorkHive-Feature-Tickets.md`](./WorkHive-Feature-Tickets.md) | Full build ticket list, ordered by dependency |
| [`WorkHive-Project-Plan-Enhanced.md`](./WorkHive-Project-Plan-Enhanced.md) | Phased build plan and the interview-ready engineering story |

---

<div align="center">

Built for the Indian freelance market — INR-native, escrow-first, trust by design.

</div>
