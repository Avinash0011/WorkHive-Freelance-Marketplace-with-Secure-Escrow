# WorkHive — A Freelance/Gig Marketplace Platform
### Enhanced, Interview-Realistic Build Plan (Mini Upwork/Fiverr)

> **Why this version is different from the original spec:** The original brief listed ~17 production subsystems (Elasticsearch, Kafka-style pub/sub, Prometheus+Grafana, blue-green deploys, chaos testing, plugin architecture...) — that's a 3-6 month, multi-engineer roadmap, not a solo/portfolio project. This version keeps the *same ambitious system-design core* but sequences it into shippable phases, so you always have a working, demoable product — and depth on the 2-3 features that actually win interviews, instead of shallow coverage of 20.

---

## 🎯 Core Thesis (what actually gets you hired)

Interviewers don't care that you touched Kafka. They care that you can explain **one hard concurrency/distributed-systems problem end-to-end**: what breaks, why, and how you fixed it. For WorkHive, that problem is:

> **"Two clients try to hire the same freelancer for conflicting jobs, or a client double-clicks 'Hire' — how do you guarantee exactly one proposal gets accepted?"**

Everything else in this plan supports that story. Build depth there first.

---

## 🧱 Phase 1 — MVP Core (Week 1-2, ships a real product)

**Goal:** A working two-sided marketplace, deployed, with the hiring race-condition solved for real.

| Feature | Detail |
|---|---|
| Auth + RBAC | JWT, two roles: `client`, `freelancer` |
| Job CRUD | Create/list/filter jobs (title, budget, deadline, skills, status) |
| Proposal flow | Freelancer submits proposal → client reviews → accept/reject |
| **Hire-lock (the centerpiece)** | Postgres row-level lock (`SELECT ... FOR UPDATE`) or Redis `SETNX` lock on `job_id` during hire. Only one proposal transitions to `accepted`; rest auto-`rejected`. Write a test that fires 20 concurrent "accept" requests and asserts exactly 1 succeeds. |
| Basic dashboards | Client: post job, view proposals, hire. Freelancer: browse, apply, track status |
| DB | PostgreSQL, 4 tables: `users`, `jobs`, `proposals`, `audit_log` |
| Currency | ₹ INR throughout — store amounts as integer paise (not float rupees), same reason real payment systems store cents: floats introduce rounding bugs at scale |
| Deploy | Railway/Render (backend) + Vercel (frontend) — free tier, but *live URL* |

**Stop here and you already have a legitimate resume project.** Everything below is what separates "good" from "top 1%."

---

## ⚙️ Phase 2 — Differentiators (Week 3, add real-time + resilience)

Pick these because each maps to a classic system-design interview question:

| Feature | Interview mapping |
|---|---|
| Redis cache on job search/listing (cache-aside, TTL) | "How would you scale a read-heavy endpoint?" |
| WebSocket events: `job:posted`, `proposal:submitted`, `job:assigned`, `escrow:funded`, `payment:released` | "Design a real-time notification system" |
| **Escrow-based payment system** (see below) | "Design a two-sided payment/marketplace flow" |
| Idempotent payment release (idempotency key + status check before charge) | "How do you prevent double-charging?" |
| Retry with exponential backoff + a Dead Letter Queue (BullMQ) for failed payment/notification jobs | "Design a reliable job queue" |
| Rate limiting (per-user, per-endpoint) | "Prevent abuse on a public API" |

### 💰 Payment system detail (₹ INR)

This is the second centerpiece feature, alongside the hire-lock. A marketplace payment flow is *not* "call a payment API and mark paid" — that's the naive version. The real version has an escrow step, because the client and freelancer don't trust each other yet:

```
1. Client hires freelancer                          → job: assigned
2. Client funds escrow (payment gateway charges client)  → job: escrowed
3. Freelancer delivers work                          → job: submitted
4. Client releases payment (escrow → freelancer payout)   → job: paid
```

**Why this matters for the interview story:** it demonstrates you understand that a marketplace is a *three-party trust problem* (platform holds funds so neither side can cheat the other), not just "process a payment."

Implementation notes:
- **Gateway**: Razorpay or Cashfree (India-first, both have solid test-mode sandboxes with no live KYC needed for a demo) — Stripe also supports INR if you'd rather stay with something more globally documented
- **Amounts stored as integer paise** (₹450.00 → `45000` paise), never floats — this is the same reason Stripe uses cents; float math silently produces ₹449.999999
- **Platform fee**: take a cut on release (e.g. 10%) — `payout = escrow_amount - platform_fee`; log both sides in `audit_log` so a client can be shown "you paid ₹45,000 platform fee ₹4,500, freelancer received ₹40,500"
- **Idempotency key** on both the "fund escrow" and "release payment" calls — generate a UUID client-side, pass it to the gateway; if the network call is retried (timeout, user double-clicks), the gateway returns the *original* result instead of charging/paying twice
- **Retry with backoff**: gateway timeouts are common — retry 2-3 times with exponential backoff before giving up and pushing to the Dead Letter Queue for manual review
- **Refund path**: if a job is disputed before delivery, escrow refunds the client — this is a good "what about the unhappy path?" answer to have ready



**Deliverable:** a 60-second demo video/gif showing a live proposal arriving via WebSocket without refresh, and a payment retry recovering from a simulated gateway failure.

---

## 📈 Phase 3 — Production Polish (Week 4, optional but high leverage)

Only add these if Phase 1+2 are rock solid — shallow versions of these hurt more than help:

- **Docker Compose** (API + Postgres + Redis) — one-command local spin-up
- **k6 load test**: report actual numbers ("job search endpoint sustains 500 req/s at p95 < 120ms with Redis cache; 40ms without = X% improvement")
- **Basic Prometheus metrics** on 3-4 key endpoints (not full Grafana suite — a `/metrics` endpoint + one dashboard screenshot is enough)
- **GitHub Actions CI** (lint + test on PR)

---

## ❌ Explicitly Cut (bad effort-to-signal ratio for a portfolio project)

| Cut | Why |
|---|---|
| Elasticsearch | Postgres full-text search (`tsvector`) gives 90% of the interview credit for 10% of the ops overhead |
| Full Kafka pub/sub | Redis pub/sub or BullMQ events tell the same "event-driven" story without a Kafka cluster to run |
| Grafana + Prometheus full stack | One `/metrics` endpoint + a screenshot is enough proof; a full observability stack is a distraction |
| Blue-green deployment | Zero-downtime deploy is a great *sentence* in an interview, terrible ROI to actually implement solo |
| Chaos testing framework | Simulate 2-3 specific failures manually (kill payment gateway mid-request) instead of building a chaos framework |
| Plugin-based module architecture | Adds abstraction with no audience — just keep modules cleanly separated by folder |
| Recurring job templates, timezone-aware scheduling, featured listings | Nice-to-haves that add zero system-design signal |

---

## 🗂️ Database Schema (Phase 1)

```
users        (id, email, password_hash, role[client|freelancer], name, skills[], created_at)
jobs         (id, client_id, title, description, budget_paise, deadline, status, freelancer_id, created_at)
proposals    (id, job_id, freelancer_id, amount_paise, message, status, created_at)
payments     (id, job_id, type[escrow|release|refund], amount_paise, platform_fee_paise,
              idempotency_key, gateway_ref, status[pending|succeeded|failed], created_at)
audit_log    (id, actor_id, action, entity_type, entity_id, metadata jsonb, created_at)
```

All money columns are `bigint`, stored in **paise** (₹1 = 100 paise) — never `float`/`numeric` for currency math.

Job lifecycle (trimmed): `draft → posted → assigned → escrowed → submitted → paid`
Proposal lifecycle: `submitted → accepted / rejected / withdrawn`

---

## 🔌 Core API Surface (Phase 1)

```
POST   /auth/register            POST /auth/login
POST   /jobs                     GET /jobs?status=&skill=&q=
GET    /jobs/:id                 PATCH /jobs/:id/close
POST   /jobs/:id/proposals       (freelancer submits)
GET    /jobs/:id/proposals       (client reviews)
POST   /proposals/:id/accept     <- the hire-lock endpoint
POST   /jobs/:id/fund-escrow     <- idempotent, charges client via gateway
POST   /jobs/:id/submit-delivery <- freelancer marks work done
POST   /jobs/:id/release-payment <- idempotent, pays freelancer minus platform fee
POST   /jobs/:id/refund          <- idempotent, returns escrow to client on dispute
```

---

## 🗣️ Interview-Ready Statement (updated, honest, still impressive)

> "I built WorkHive, a two-sided freelance marketplace with role-based dashboards for clients and freelancers, handling payments in INR through an escrow flow — client funds are held on hire and released to the freelancer only after delivery, with a platform fee taken on release. The core engineering problem I solved was preventing double-hiring under concurrent requests — I used [Postgres row locking / Redis distributed locks] and verified it with a concurrency test firing 20 simultaneous hire requests, asserting exactly one succeeds. Payment operations (escrow funding and release) use idempotency keys so retried gateway calls never double-charge or double-pay, backed by exponential-backoff retries and a dead-letter queue for anything that still fails. I added Redis caching for job search and WebSocket-based real-time status updates, and load tested the search endpoint with k6, improving p95 latency by [X]% with caching."

This is a **true, specific, defensible sentence** — every clause maps to something you can open the code and explain, which is exactly what survives a follow-up question.

---

## ⏱️ Suggested Timeline

| Week | Focus |
|---|---|
| 1 | Auth, RBAC, job CRUD, DB schema, basic UI |
| 2 | Proposal flow + **hire-lock + concurrency test** (this is your centerpiece — don't rush it) |
| 3 | Redis cache, WebSockets, idempotent payments, retry/DLQ |
| 4 (optional) | Docker, k6 load test, CI, metrics endpoint |

Total: **2 weeks for a legit project, 3-4 for a standout one.** Not 17 undated steps.

---

## 🖥️ Pages & UI Flow (Phase 1 scope — build these screens first)

> This is the actual page map: what a visitor sees before logging in, how signup splits into two roles, and what each role's dashboard contains. Treat this as the frontend checklist alongside Phase 1.

### 1. Home Page (public, no login required)

The home page is the pitch — a visitor should understand what WorkHive is and how it works in one scroll, without logging in.

| Section | Content |
|---|---|
| **Navbar** | Logo, "How it works", "Browse jobs" (public preview), `Log in`, `Sign up` (primary CTA) |
| **Hero** | One-line thesis ("Hire, work, and get paid in ₹ — with your money held safe until the job's done"), sub-line, two CTAs: **"I want to hire"** → signup as Creator, **"I want to work"** → signup as Worker |
| **How it works** | Two parallel tracks, shown side by side so both roles see themselves immediately: **Creator track** — Post a job → Review pitches → Hire & fund escrow → Release payment. **Worker track** — Browse jobs → Send a pitch → Get hired → Deliver & get paid. |
| **Trust/features strip** | Escrow protection ("money is locked before work starts, released only when you approve it"), Fair hiring ("one freelancer gets hired per job — no double-booking"), Transparent fees ("see the platform fee before you accept, every time"), INR-native ("built for Indian creators and workers, no currency conversion") |
| **Live activity strip (optional, decorative)** | A scrolling ticker of recent-looking marketplace activity ("Job posted • Logo design • ₹8,000", "Payment released • Landing page copy • ₹12,500") — signals the platform is alive, doesn't need to be real-time for MVP |
| **Footer** | About, Terms, Contact, role-based CTAs repeated |

### 2. Auth — Login & Signup

- **Signup** starts with a role choice, shown as two clear cards before any form field: **"I'm a Creator — I want to hire"** vs **"I'm a Worker — I want to find work"**. Role is fixed at signup (matches the `client` / `freelancer` RBAC roles in Phase 1) and determines which dashboard the person lands on.
- Creator signup fields: name, email, password, (optional) company/brand name.
- Worker signup fields: name, email, password, headline (e.g. "React Developer"), skills (tag input).
- **Login** is role-agnostic — one form, and the backend routes to the correct dashboard based on the stored role on the user record.
- On successful signup, auto-login and redirect straight into the matching dashboard — don't make a new user log in twice.

### 3. Creator Dashboard (client role)

| Tab | What it does |
|---|---|
| **Overview** | Wallet balance (₹), quick stats: jobs posted, active contracts, total spent, pending proposals to review |
| **Post a Job** | Form: title, category, description, budget (₹, fixed price for MVP), deadline, required skills (tags) → creates job with status `posted` |
| **My Jobs** | List of posted jobs grouped by status. Each job expands to show: **Proposals inbox** (worker name, pitch message, bid amount, "Hire" button — hiring one proposal auto-rejects the rest, this is the hire-lock from Phase 1 surfaced in the UI), **Fund Escrow** button once hired, **Review delivery & Release Payment** button once the worker submits, with a visible fee breakdown before confirming ("You pay ₹45,000 → Platform fee ₹4,500 → Worker receives ₹40,500") |
| **Payments** | Transaction history: every escrow-funded and payment-released event, with job name, amount, and date — this is the audit trail from the `payments`/`audit_log` tables made visible |

### 4. Worker Dashboard (freelancer role)

| Tab | What it does |
|---|---|
| **Overview** | Wallet balance (₹), quick stats: proposals sent, active contracts, total earned, profile rating |
| **Browse Jobs** | List/search of open jobs (filter by skill, budget range, category) — this is the public job feed |
| **Send a Pitch** | On any open job: proposal form — bid amount (₹) + pitch message. Submitting creates a `proposals` row with status `pending` |
| **My Proposals** | Every pitch sent, with live status: `pending` / `accepted` / `rejected` |
| **My Contracts** | Jobs the worker was hired for. Once the creator funds escrow, a **"Submit Delivery"** button appears (link/notes field) → flips job to `submitted` and waits on the creator to release payment |
| **Earnings** | Transaction history of payments received, plus a **Withdraw** action (mocked payout in MVP, real payout method in Phase 4+ per section E) |

### 5. Status flow, mapped to what the person sees on screen

```
draft → posted → assigned → escrowed → submitted → paid
  |        |         |          |          |         |
 (Creator (Visible  (Creator   (Creator   (Worker   (Creator
  saving   on Home   hires a    funds      clicks    reviews +
  draft)   + Browse  proposal;  escrow;     "Submit   releases
           Jobs)     rest auto- worker      Delivery")payment;
                     rejected)  sees job                worker
                                move to                  gets ₹,
                                "My                       both can
                                Contracts")                leave a
                                                            review)
```

### 6. Worth adding on top of the base spec (small effort, real product feel)

- **Two-way ratings/reviews** after a job is `paid` (already in section G below) — surface this directly on both dashboards right after payment release, don't bury it.
- **"Add funds" on the Creator wallet** — since there's no real bank behind the MVP wallet, give creators a way to top up their demo balance so they can actually test funding escrow.
- **Empty states with direction, not just blank screens** — e.g. Browse Jobs with no results says what to try next; My Proposals with nothing sent yet links straight to Browse Jobs.
- **Notification bell** (in-app only for MVP) — new proposal received, hired, payment released — cheap to add once the WebSocket events from Phase 2 exist, and makes the dashboards feel alive instead of static.

---
---

# 🌐 Full Upwork Feature Parity (Phase 4+, extended scope)

> **Prototype scope note:** the working prototype (WorkHive-Prototype.jsx) intentionally leaves out the dispute/admin flow (section H) and ID verification (the 🟡 KYC bullet under section A) to keep the demo focused on the hire-lock + escrow/hourly payment story. This section still documents them in full below — treat them as "add these next" rather than "already built."

> **Scope check first:** this section lists *every* facility Upwork actually has — real product surface, not the marketing page. It is genuinely 6-12+ months for a full team, not a solo add-on. Everything is tagged so you can pick a slice instead of drowning:
> - 🔴 **Must** — Upwork doesn't function as a marketplace without this
> - 🟡 **Should** — real differentiators once the core loop works
> - ⚪ **Nice** — completeness/polish, low interview ROI relative to effort
>
> If you want "feels like Upwork" rather than "is Upwork," build every 🔴 and pick 2-3 🟡 per category. That's realistically Phase 4 (2-3 more weeks on top of the 4-week plan above).

## A. Identity, trust & profiles
- 🔴 Freelancer profile: photo, title, bio, hourly rate, skills, work history, portfolio items
- 🔴 Client profile: company info, payment verification badge, hiring history
- 🟡 Portfolio with case-study style entries (images, description, outcome)
- 🟡 ID verification (government ID upload + selfie match — use a KYC provider like Onfido/HyperVerge, don't build this yourself) *(not in current prototype — was cut to keep the demo focused)*
- 🟡 Skill certifications / tests (multiple-choice skill assessments, badge on profile)
- ⚪ Video intro on profile
- ⚪ LinkedIn / GitHub import for auto-filled work history

## B. Job discovery & talent search
- 🔴 Job search with filters: category, budget range, skill, experience level, job type (fixed/hourly)
- 🔴 Job detail page with client's hiring history/rating visible to freelancers
- 🟡 Full-text search (this is where Elasticsearch or Postgres `tsvector` actually earns its place at this scope — revisit the earlier "cut" once you're here)
- 🟡 Saved jobs + saved searches with alerts ("notify me when a React job under ₹50k posts")
- 🟡 Client-side talent search (browse freelancer profiles directly, not just wait for proposals)
- 🟡 Invite freelancer to a job (client-initiated, skips the open-proposal queue)
- ⚪ "Similar jobs" / recommendation feed

## C. Contracts: fixed-price & hourly
- 🔴 Fixed-price contracts with **milestones** (split ₹ budget into stages, each released independently — this is a bigger, more realistic version of the escrow flow you already have)
- 🟡 Hourly contracts with a weekly cap (client sets max billable hours/week)
- 🟡 Contract terms/offer negotiation before both sides accept (counter-offer on rate)
- ⚪ Contract templates / NDAs attached to a contract

## D. Time tracking (hourly work — Upwork's "Work Diary")
- 🟡 Desktop time-tracking app (Electron) with start/stop timer
- 🟡 Periodic screenshots (e.g. every 10 min) + activity level (keyboard/mouse %) stored alongside each time block
- 🟡 Client can view the Work Diary and dispute specific hours before payment
- ⚪ Manual time entry with client approval

*Honest note: Work Diary is the single most expensive Upwork feature to replicate (desktop app + screenshot storage + activity tracking + privacy handling). Build it only if hourly contracts are core to your story — otherwise fixed-price + milestones covers most interview-relevant ground.*

## E. Payments & financial operations
*(builds on the escrow system you already have)*
- 🔴 Escrow funding + milestone-based release *(done — see Phase 2 above)*
- 🔴 Idempotent payment processing *(done)*
- 🟡 Multiple withdrawal methods for freelancers (bank transfer, PayPal, Payoneer equivalent — pick 1-2 to actually integrate, mock the rest)
- 🟡 Sliding service fee structure (Upwork charges freelancers a declining % as lifetime billings with a client grow — a nice "business logic" feature to show off)
- 🟡 Invoices/statements per contract, downloadable
- ⚪ Tax document generation (1099/W-9 equivalent — India: TDS certificates) — mock this, don't actually try to be tax-compliant
- ⚪ Connects system (freelancers spend "credits" to submit proposals — Upwork's monetization lever)

## F. Communication & collaboration
- 🔴 In-app messaging between client and freelancer per contract (you have WebSocket infra already — extend it)
- 🟡 File sharing in chat (attach deliverables, references)
- ⚪ Video calls (Upwork doesn't build this natively either — they'd deep-link to Zoom/Meet; do the same, don't build WebRTC from scratch)
- ⚪ Read receipts / typing indicators

## G. Reputation & growth
- 🔴 Two-way reviews after contract completion (client rates freelancer, freelancer rates client), shown on profile
- 🟡 Job Success Score-style metric: computed from completion rate, on-time delivery, review scores — a genuinely good "design a scoring algorithm" interview story
- 🟡 Freelancer tiers/badges (e.g. "Rising Talent", "Top Rated") auto-assigned by the JSS-style metric
- ⚪ Public profile URL / shareable portfolio link

## H. Dispute resolution & support *(not in current prototype)*
- 🟡 Dispute flow: either party flags a contract, funds freeze, admin role reviews and resolves (refund / release / split)
- ⚪ Support ticket system
- ⚪ Admin moderation dashboard for flagged jobs/messages

*This whole section was cut from the prototype rather than half-built — a "raise a dispute" button with nobody to resolve it is worse than not having the button. If you want this, build the admin console and resolution flow together, not separately.*

## I. Enterprise / agency
- ⚪ Agency accounts (one login manages multiple freelancer sub-profiles)
- ⚪ Team/company accounts for clients (multiple seats, shared billing)
- ⚪ Enterprise reporting (spend by department, approval workflows)

*These are real Upwork Business/Enterprise features but they're B2B sales surface, not engineering depth — lowest priority for a portfolio project.*

## J. Notifications & mobile
- 🟡 Email notifications (new proposal, hired, payment released, message received) — you already have the event ledger; wire a subset to an email service (Resend/SendGrid)
- 🟡 In-app notification center (bell icon, unread count) — trivial once WebSocket events exist
- ⚪ Push notifications (would need a real mobile app — React Native — out of scope unless mobile is your goal)

---

## 🗺️ Recommended build order if you want full parity

| Phase | Adds | Duration |
|---|---|---|
| 1-3 (above) | Core loop: auth, jobs, proposals, hire-lock, escrow payments, WebSocket events | 3-4 weeks |
| 4 | Milestones for fixed-price, in-app messaging, reviews, saved jobs/search, talent search | 2-3 weeks |
| 5 | Job Success Score algorithm, freelancer tiers, dispute flow + admin dashboard *(not in prototype)* | 2 weeks |
| 6 | ID verification (KYC) *(not in prototype)*, full-text search at scale, notification service | 1-2 weeks |
| 7 (optional) | Hourly contracts + Work Diary (desktop app + screenshots) | 2-3 weeks — biggest single addition |

**Total for genuine Upwork-level parity: ~10-14 weeks.** That's not a discouragement — it's the honest number so you can decide how much of it you actually need for your goal (portfolio project vs. a real product vs. a specific interview story). If the goal is still "top resume project for an SDE interview," Phases 1-4 already gets you further than 95% of candidates; Phases 5-7 start mattering more if you're aiming at a founding-engineer or marketplace-specific role.
