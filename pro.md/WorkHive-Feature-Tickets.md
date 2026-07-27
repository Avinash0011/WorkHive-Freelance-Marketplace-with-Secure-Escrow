# Feature Ticket List: WorkHive

**Status:** Draft v1.0
**Owner:** Engineering
**Last updated:** July 19, 2026
**Companion docs:** WorkHive-PRD.md, WorkHive-Technical-Architecture.md, WorkHive-Security-and-Access.md, WorkHive-Frontend-Specification.md

---

## How to use this document

Each ticket below is written to be pasted directly into an AI coding tool (Claude Code, Cursor, etc.) as a self-contained prompt. Every ticket assumes the tech context below is already known to the tool — paste it once at the start of a session, or keep it in a project-level instructions file, rather than repeating it in every ticket.

**Shared tech context (assume this for every ticket):**
> Stack: React 18 + TypeScript + Vite (frontend, `apps/web`), Node.js + Express + TypeScript (backend, `apps/api`), PostgreSQL via Prisma ORM, Redis via ioredis, BullMQ for background jobs, Socket.io for real-time events, JWT (access + refresh) for auth, Razorpay/RazorpayX for payments, Tailwind CSS for styling. Money is always stored and calculated server-side as a `bigint` in paise, never a float. Full schema and folder structure are in WorkHive-Technical-Architecture.md; design tokens (colors, type, spacing, components) are in WorkHive-Frontend-Specification.md — reference both directly rather than re-deriving them.

**Tickets are ordered by dependency, not by priority** — build roughly top to bottom within each epic. Priority labels tell you what's safe to skip or defer, not what order to build in.

**Priority key:** 🔴 Must-have (launch blocker) · 🟡 Should-have (fast-follow) · ⚪ Nice-to-have (defer)

---

## Epic A — Foundation

### WH-001: Project scaffolding and monorepo setup
**Priority:** 🔴 Must-have
**Depends on:** None

**Description:**
Set up the WorkHive monorepo exactly matching the folder structure in WorkHive-Technical-Architecture.md, Section 3: `apps/web` (Vite + React + TypeScript), `apps/api` (Express + TypeScript), `packages/shared` (shared TS types and Zod schemas). Add a root `docker-compose.yml` that spins up PostgreSQL and Redis for local development. Add `.env.example` files in both `apps/web` and `apps/api` listing every variable from the architecture doc, Section 6, with no real values. Add a root `README.md` explaining how to run `docker compose up -d` and start both apps locally.

**Acceptance criteria:**
- [ ] `apps/web`, `apps/api`, `packages/shared` exist with the exact sub-folder structure from the architecture doc
- [ ] `docker compose up -d` starts a working local Postgres and Redis
- [ ] Both apps start locally (`npm run dev` in each) without errors, even with no real third-party keys set
- [ ] `.env.example` files exist and list every variable name from the architecture doc's env var section
- [ ] `packages/shared` is importable from both `apps/web` and `apps/api`

---

### WH-002: Database schema and Prisma setup
**Priority:** 🔴 Must-have
**Depends on:** WH-001

**Description:**
Implement the full `prisma/schema.prisma` in `apps/api` exactly matching every table, field, type, and relationship described in WorkHive-Technical-Architecture.md, Section 4: `users`, `jobs`, `proposals`, `payments`, `reviews`, `audit_log`. All money fields are `BigInt`. All enums match the documented values exactly (job status, proposal status, payment type/status, user role). Add the unique constraints called out in the doc: `users.email`, `proposals(job_id, freelancer_id)`, `reviews(job_id, reviewer_id)`, `payments.idempotency_key`. Generate an initial migration and a `prisma/seed.ts` script that creates at least 2 Creators, 3 Workers, and jobs in a spread of statuses (`posted`, `assigned`, `escrowed`, `paid`).

**Acceptance criteria:**
- [ ] `npx prisma migrate dev` runs cleanly against the local Docker Postgres with no errors
- [ ] Every table/field/relationship matches the architecture doc exactly, including which fields are nullable
- [ ] All four unique constraints exist and are enforced (verified by attempting to violate each one in a quick test)
- [ ] `npx prisma db seed` populates a working demo dataset covering every job status
- [ ] Prisma Client types are correctly generated and importable in `apps/api/src`

---

### WH-003: Auth — signup and login (JWT access + refresh)
**Priority:** 🔴 Must-have
**Depends on:** WH-002

**Description:**
Build `POST /auth/register` and `POST /auth/login` in `apps/api`. Registration requires `email`, `password`, `name`, `role` (`client` or `freelancer`), plus `headline`/`skills` if `role === 'freelancer'`. Hash passwords with bcrypt (never store plaintext). On successful login, issue a short-lived JWT access token (15 min) in the response body and a long-lived refresh token (7 days) as an httpOnly, secure cookie. Build `POST /auth/refresh` to mint a new access token from a valid refresh cookie, and `POST /auth/logout` to invalidate it. Validate all input with Zod, matching WorkHive-Security-and-Access.md, Section 2 (generic "email or password incorrect" message on failed login — never reveal which part was wrong).

**Acceptance criteria:**
- [ ] Registering with a duplicate email returns a clear, specific error without revealing whether the email belongs to a Creator or Worker
- [ ] Passwords are never stored or logged in plaintext anywhere, verified by inspecting the database directly
- [ ] A failed login attempt returns an identical generic message regardless of whether the email exists or the password is wrong
- [ ] A valid login returns a working access token and sets a working httpOnly refresh cookie
- [ ] `/auth/refresh` successfully issues a new access token given a valid refresh cookie, and fails cleanly given an expired/invalid one
- [ ] Logging out invalidates the refresh token server-side, not just client-side

---

### WH-004: Auth middleware and role-based access control
**Priority:** 🔴 Must-have
**Depends on:** WH-003

**Description:**
Build `auth.middleware.ts` (verifies the JWT access token on protected routes, attaches `req.user` with `id` and `role`) and `rbac.middleware.ts` (a `requireRole('client' | 'freelancer')` guard) in `apps/api/src/middleware`. Apply these to every route that isn't public. Any request with a missing/invalid/expired token gets a 401 with a generic message. Any request from a correctly authenticated user attempting an action outside their role gets a 403 with the generic "You don't have permission to do that" message from WorkHive-Security-and-Access.md, Section 5.5 — never a message that confirms or denies whether the target resource exists.

**Acceptance criteria:**
- [ ] Every non-public route rejects requests with no token or an invalid token (401)
- [ ] A Worker calling a Creator-only endpoint (e.g. "post a job") gets a 403 with the generic permission message
- [ ] A Creator requesting a job ID that belongs to another Creator gets the same generic error whether or not that job ID actually exists
- [ ] `req.user` is reliably populated on every protected route for use in downstream ownership checks

---

## Epic B — Home page and marketing

### WH-005: Home page — hero, how it works, features
**Priority:** 🔴 Must-have
**Depends on:** WH-001

**Description:**
Build the public home page in `apps/web/src/pages/Home.tsx` using the design tokens in WorkHive-Frontend-Specification.md exactly (colors, type scale, spacing). Include: navbar (logo, "How it works," "Browse jobs," Log in, Sign up), hero section with the dual CTA ("I want to hire" → `/signup?role=client`, "I want to work" → `/signup?role=freelancer`), a two-column "How it works" section (Creator track vs Worker track, per WorkHive-Project-Plan-Enhanced.md's UI Flow section), a features/trust strip (escrow protection, fair hiring, transparent fees, INR-native), and a footer. This page must render correctly and be fully readable with no logged-in user and no data loaded from the API.

**Acceptance criteria:**
- [ ] Page matches the color palette, typography, and spacing tokens from the Frontend Specification exactly — no ad hoc colors or sizes
- [ ] Both hero CTAs route to the signup page with the correct role pre-selected via query param
- [ ] "How it works" clearly shows both the Creator and Worker paths side by side
- [ ] Page is fully responsive down to `--breakpoint-sm` (480px) with no horizontal scroll or overlapping elements
- [ ] Page passes a basic accessibility check: visible keyboard focus on every interactive element, sufficient color contrast on all text

---

### WH-006: Auth pages — signup with role selection, login
**Priority:** 🔴 Must-have
**Depends on:** WH-003, WH-005

**Description:**
Build `apps/web/src/pages/Auth/Signup.tsx` and `Login.tsx`. Signup starts with two large role-selection cards ("I'm a Creator" / "I'm a Worker") before showing any form fields — role is pre-selected if arriving via a `?role=` query param from the home page, but still changeable. Show role-specific fields (headline + skills tag input for Worker) only after role is chosen. Use React Hook Form + Zod for validation, with the same validation rules as the backend (share the Zod schema from `packages/shared` rather than redefining it). On success, auto-login and redirect straight to the correct dashboard (`/creator` or `/worker`) — do not make a freshly signed-up user log in again.

**Acceptance criteria:**
- [ ] Role selection is the first thing shown on signup, with no form fields visible until a role is picked
- [ ] Arriving from the home page's "I want to hire"/"I want to work" CTA pre-selects the matching role
- [ ] Field-level validation errors appear next to the specific field, not as a generic top-of-page banner
- [ ] A successful signup redirects immediately into the correct dashboard with no second login step
- [ ] Login form works for both roles and redirects to the correct dashboard based on the account's stored role

---

## Epic C — Creator (Client) dashboard

### WH-007: Creator dashboard shell and navigation
**Priority:** 🔴 Must-have
**Depends on:** WH-004, WH-006

**Description:**
Build the Creator dashboard layout in `apps/web/src/pages/creator/CreatorDashboard.tsx` — fixed left navigation (Overview, Post a Job, My Jobs, Payments) per the Frontend Specification's dashboard layout rules, collapsing to icon-only below `--breakpoint-md`. Route guard: redirect to `/login` if not authenticated, redirect to `/worker` if authenticated as a Worker. Overview tab shows wallet balance (mono font, per Frontend Spec) and quick stats (jobs posted, active contracts, total spent) — stats can be placeholder-wired to real endpoints in WH-009/WH-014.

**Acceptance criteria:**
- [ ] Navigating to `/creator` while logged out redirects to `/login`
- [ ] Navigating to `/creator` while logged in as a Worker redirects to `/worker`, not an error page
- [ ] Sidebar collapses to icon-only below `--breakpoint-md` and expands on tap
- [ ] Wallet balance renders in the mono numeric style from the Frontend Specification

---

### WH-008: Post a Job
**Priority:** 🔴 Must-have
**Depends on:** WH-007

**Description:**
Build the "Post a Job" flow — a modal per the Frontend Spec's modal component rules, triggered from the Creator dashboard. Form fields: title, description, budget (currency input component per Frontend Spec Section 1.6 — ₹ prefix, thousands separator, stores as paise), deadline (date picker), required skills (tag input). Backend: `POST /jobs`, validated with Zod, creates a `jobs` row with `status: 'posted'` and `client_id` from the authenticated user. Write an `audit_log` row for `job.posted`.

**Acceptance criteria:**
- [ ] Budget entered as "50,000" in the UI is stored as `5000000` (paise) in the database, verified directly
- [ ] Submitting with a budget below a sane minimum (e.g. ₹500) shows a specific field-level error, not a generic failure
- [ ] A successfully posted job appears immediately in the Creator's "My Jobs" list without a manual page refresh
- [ ] The job does not appear in another Creator's "My Jobs" list
- [ ] An `audit_log` row is created for the post action

---

### WH-009: My Jobs list and job detail
**Priority:** 🔴 Must-have
**Depends on:** WH-008

**Description:**
Build `GET /jobs?mine=true` (Creator's own jobs, any status) and the "My Jobs" tab UI — a list of job cards grouped or filterable by status, each expandable into a detail view showing full description, budget, deadline, and status. This ticket covers listing and viewing only — hiring, funding, and payment release are separate tickets (WH-011, WH-012, WH-013) that build on this view.

**Acceptance criteria:**
- [ ] `GET /jobs?mine=true` returns only jobs where `client_id` matches the authenticated user — verified by attempting the request as a different Creator
- [ ] Each job card shows a status badge matching the color mapping in the Frontend Specification
- [ ] Clicking a job card expands/navigates to a detail view with the full job description and current status
- [ ] Empty state (no jobs posted yet) shows direction, not a blank screen, per WorkHive-Project-Plan-Enhanced.md's UI notes

---

### WH-010: Proposals inbox
**Priority:** 🔴 Must-have
**Depends on:** WH-009

**Description:**
Build `GET /jobs/:id/proposals` (Creator-only, only for jobs they own) and the proposal inbox UI inside the job detail view — a list of proposal cards (Worker name + rating, bid amount in mono, pitch message, "Hire" button) per the Frontend Spec's proposal card component. This ticket covers viewing proposals only; the "Hire" button's actual logic is WH-011.

**Acceptance criteria:**
- [ ] `GET /jobs/:id/proposals` returns 403 if the requesting user doesn't own the job
- [ ] Proposal cards show bid amount and the Hire button without requiring a scroll inside the card
- [ ] Proposals are sorted with a sensible default (e.g. newest first) and the sort is visible/understandable to the user
- [ ] A job with zero proposals shows a clear empty state, not a blank list

---

### WH-011: Hire a Worker (the hire-lock)
**Priority:** 🔴 Must-have — this is the product's centerpiece
**Depends on:** WH-010

**Description:**
Build `POST /proposals/:id/accept` implementing the hire-lock transaction exactly as specified in WorkHive-Technical-Architecture.md, Section 5.1: inside a single Prisma `$transaction`, lock the job row (`SELECT ... FOR UPDATE`), re-check `status === 'posted'` inside the lock, and only then update the job to `assigned` (setting `freelancer_id` and `agreed_amount_paise` from the accepted proposal) and flip every other proposal on that job to `rejected`. Explicitly block a Creator from hiring themselves (`client_id !== freelancer_id` check) per WorkHive-Security-and-Access.md, Section 6, Group A. Wire the "Hire" button from WH-010 to this endpoint, with a confirmation modal before the action fires. Write an integration test that fires at least 20 concurrent accept requests against the same job and asserts exactly one succeeds.

**Acceptance criteria:**
- [ ] The concurrency test (20 simultaneous accept requests on one job) passes with exactly one `accepted` proposal and the rest `rejected`
- [ ] Attempting to hire on a job that's no longer `posted` returns a clear "This job is no longer open" error, not a silent failure
- [ ] A Creator cannot hire themselves, even via a direct API call bypassing the UI
- [ ] Once hired, the job no longer accepts new proposals (`POST /jobs/:id/proposals` rejects on a non-`posted` job)
- [ ] An `audit_log` row is written recording the hire action, actor, and timestamp
- [ ] The hired Worker sees their proposal status update to `accepted` and the job appear in "My Contracts" without a manual refresh (polling is acceptable at this stage; WebSocket push is WH-028)

---

### WH-012: Fund escrow (Razorpay integration)
**Priority:** 🔴 Must-have
**Depends on:** WH-011

**Description:**
Build the escrow funding flow per WorkHive-Frontend-Specification.md, Section 2.2.1: `POST /jobs/:id/fund-escrow` creates a Razorpay order (`amount` = `agreed_amount_paise`, `receipt` = `job_id`), the frontend opens Razorpay Checkout with the returned `order_id`, and on completion the backend independently verifies the payment signature server-side before trusting it (never trust the frontend's success callback alone). On verified success: create a `payments` row (`type: escrow`, `status: succeeded`), update `jobs.status` to `escrowed`. Require and check an idempotency key on the funding request per WorkHive-Technical-Architecture.md, Section 5.2, so a double-click cannot double-charge. Show insufficient-balance and payment-failure states matching the exact copy in WorkHive-Security-and-Access.md, Section 5.3.

**Acceptance criteria:**
- [ ] A successful escrow funding moves the job to `escrowed` and creates a `payments` row with the correct `gateway_ref`
- [ ] Submitting the same idempotency key twice (simulating a double-click or retry) results in exactly one `payments` row and one charge, not two
- [ ] A failed/declined payment leaves the job in `assigned` status with a clear "your money was not moved" message, never a silent or ambiguous state
- [ ] The payment signature is verified server-side; a request that skips this verification is rejected
- [ ] Only the job's owning Creator can fund escrow on it (403 otherwise)

---

### WH-013: Review delivery and release payment
**Priority:** 🔴 Must-have
**Depends on:** WH-012, WH-019 (Worker must be able to submit delivery for this to be end-to-end testable)

**Description:**
Build the payment release flow: `POST /jobs/:id/release-payment`, callable only when `jobs.status === 'submitted'` and only by the owning Creator. Calculate `platform_fee_paise` and `payout_paise` server-side from `PLATFORM_FEE_PERCENT` (never trust a client-sent fee value). Initiate a RazorpayX payout per WorkHive-Frontend-Specification.md, Section 2.2.2, create a `payments` row (`type: release`, `status: pending` until the webhook confirms), and only finalize `jobs.status = 'paid'` on the confirmed `payout.processed` webhook — not at the moment the API call returns, since a payout is only "initiated" at that point (see WH-014's webhook handler, built alongside this). The frontend confirmation modal must show the full fee breakdown ("Job total → Platform fee → Worker receives") before the Creator confirms, per the Frontend Specification's modal rules.

**Acceptance criteria:**
- [ ] Payment release is only possible when the job is in `submitted` status — attempting it on any other status returns a clear error
- [ ] The fee breakdown shown in the confirmation modal exactly matches what's actually charged/paid server-side
- [ ] `jobs.status` only becomes `paid` after the `payout.processed` webhook is received and its signature verified, not immediately on API call
- [ ] A `payout.reversed` webhook correctly marks the payment as `failed` and does not leave the job silently stuck in `submitted`
- [ ] Only the job's owning Creator can release payment on it

---

### WH-014: Creator payments and transaction history
**Priority:** 🔴 Must-have
**Depends on:** WH-012

**Description:**
Build `GET /payments?mine=true` (Creator's own payment records only, joined with job title) and the "Payments" tab UI — a table matching the transaction row component in the Frontend Specification (date, job title, type badge, right-aligned mono amount, status badge). Also implement the Razorpay webhook receiver endpoint (`POST /webhooks/razorpay`) here if not already built in WH-012/WH-013, verifying `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET` before processing any event, per WorkHive-Frontend-Specification.md, Section 2.2.3.

**Acceptance criteria:**
- [ ] The Payments tab shows every escrow and release transaction for the Creator's own jobs, correctly formatted
- [ ] A webhook call with an invalid or missing signature is rejected outright and never processed
- [ ] Table amounts are right-aligned and use the mono numeric style from the Frontend Specification
- [ ] `GET /payments?mine=true` never returns another user's payment records

---

## Epic D — Worker (Freelancer) dashboard

### WH-015: Worker dashboard shell and navigation
**Priority:** 🔴 Must-have
**Depends on:** WH-004, WH-006

**Description:**
Same pattern as WH-007, mirrored for the Worker role: `apps/web/src/pages/worker/WorkerDashboard.tsx`, left nav (Overview, Browse Jobs, My Proposals, My Contracts, Earnings), route guard redirecting logged-out users to `/login` and Creators to `/creator`.

**Acceptance criteria:**
- [ ] Navigating to `/worker` while logged out redirects to `/login`
- [ ] Navigating to `/worker` while logged in as a Creator redirects to `/creator`
- [ ] Overview tab shows wallet balance and placeholder stats matching the Frontend Specification's stat card component

---

### WH-016: Browse Jobs feed
**Priority:** 🔴 Must-have
**Depends on:** WH-015

**Description:**
Build `GET /jobs?status=posted` with query params for skill and budget-range filtering, cached cache-aside style in Redis with a short TTL (per the architecture doc's Redis usage), and the "Browse Jobs" UI — a responsive card grid per the Frontend Specification's job card component. A Worker must never see jobs in `draft` status, per the row-level security rules in WorkHive-Security-and-Access.md, Section 4.

**Acceptance criteria:**
- [ ] `GET /jobs?status=posted` never returns `draft` jobs, even via a crafted query string
- [ ] Skill and budget filters actually narrow the results and are reflected in the URL (shareable/bookmarkable filtered view)
- [ ] The Redis cache is correctly invalidated when a new job is posted or a job's status changes, so results don't go stale
- [ ] Empty search results show a clear "try different filters" direction, not a blank grid

---

### WH-017: Send a Pitch (submit proposal)
**Priority:** 🔴 Must-have
**Depends on:** WH-016

**Description:**
Build `POST /jobs/:id/proposals` and the pitch submission form (bid amount using the currency input component, pitch message textarea). Enforce the unique constraint from WH-002 (`job_id`, `freelancer_id`) at the API level with a clear "you've already pitched on this job" message rather than a raw constraint-violation error. Reject submissions on jobs that aren't `status: 'posted'`.

**Acceptance criteria:**
- [ ] A Worker cannot submit a second pitch on the same job — attempting it returns a specific, human-readable error
- [ ] Pitching on a job that's already `assigned` or later returns a clear "this job is no longer open" error
- [ ] A successful pitch appears immediately in the Worker's "My Proposals" tab
- [ ] Bid amount is stored server-side as paise, matching the currency handling convention throughout

---

### WH-018: My Proposals tracker
**Priority:** 🔴 Must-have
**Depends on:** WH-017

**Description:**
Build `GET /proposals?mine=true` and the "My Proposals" tab UI listing every pitch the Worker has sent, with live status (`pending`/`accepted`/`rejected`) using the status badge component and color mapping from the Frontend Specification. Include a "withdraw" action on `pending` proposals only (`POST /proposals/:id/withdraw`), which is blocked once a proposal is `accepted` or `rejected`.

**Acceptance criteria:**
- [ ] `GET /proposals?mine=true` never returns another Worker's proposals
- [ ] Status badges match the Frontend Specification's color mapping exactly
- [ ] Withdraw is only available on `pending` proposals and correctly disabled/hidden otherwise
- [ ] Withdrawing a proposal correctly updates its status without affecting other proposals on the same job

---

### WH-019: My Contracts and Submit Delivery
**Priority:** 🔴 Must-have
**Depends on:** WH-011, WH-012

**Description:**
Build `GET /jobs?hired=true` (jobs where the authenticated user is `freelancer_id`) and the "My Contracts" tab, showing jobs in `assigned` or `escrowed` status with a clear "waiting on Creator to fund escrow" state for `assigned` jobs. Build `POST /jobs/:id/submit-delivery` (Worker-only, only on jobs they're hired for, only when `status === 'escrowed'`), accepting a delivery note/link and moving the job to `submitted`.

**Acceptance criteria:**
- [ ] A Worker sees a clear "waiting on escrow" state for `assigned` jobs and cannot submit delivery until the job reaches `escrowed`
- [ ] Submit Delivery is only callable by the hired Worker on that specific job (403 for anyone else, including other Workers)
- [ ] A successful delivery submission moves the job to `submitted` and is immediately reflected in the Creator's job detail view (polling acceptable pre-WH-028)
- [ ] Delivery note/link is required and validated (not an empty submission)

---

### WH-020: Worker earnings and withdraw
**Priority:** 🔴 Must-have
**Depends on:** WH-013

**Description:**
Build `GET /payments?mine=true` for the Worker role (mirrors WH-014) and the "Earnings" tab. Add a `POST /users/me/withdraw` endpoint that decreases `wallet_balance_paise` and creates a `payments` row (`type: withdrawal`), with copy matching realistic payout expectations (e.g. "Your withdrawal has been initiated — funds typically arrive in 1-3 business days"). For MVP this can be a single supported payout method (bank transfer) — multiple methods are WH-034 (nice-to-have).

**Acceptance criteria:**
- [ ] Earnings tab correctly shows only the Worker's own payment-received records
- [ ] Attempting to withdraw more than the current wallet balance is rejected with a specific error, not a negative balance
- [ ] A successful withdrawal decreases the wallet balance exactly once, even under a rapid double-click (idempotency-protected, same pattern as WH-012)

---

## Epic E — Trust and shared systems

### WH-021: Two-way review system
**Priority:** 🔴 Must-have
**Depends on:** WH-013

**Description:**
Build `POST /jobs/:id/reviews` (rating 1-5 + optional comment), enforceable only when `jobs.status === 'paid'` and only by a participant in that specific job (Creator or Worker), with the unique constraint from WH-002 preventing a second review by the same reviewer on the same job. Surface the review prompt directly on both dashboards immediately after payment release, per WorkHive-Project-Plan-Enhanced.md's UI notes ("don't bury it"). Recalculate and store `users.rating_avg` on new review (denormalized, per the architecture doc).

**Acceptance criteria:**
- [ ] A review cannot be submitted on a job that isn't `paid`, verified via direct API call bypassing the UI
- [ ] A user cannot submit a second review on the same job (unique constraint enforced, clear error message)
- [ ] `users.rating_avg` updates correctly and visibly on the reviewed user's public profile immediately after a new review
- [ ] The review prompt appears automatically on both dashboards right after a payment release, not requiring the user to find it

---

### WH-022: Wallet balance and Add Funds (demo top-up)
**Priority:** 🔴 Must-have
**Depends on:** WH-003

**Description:**
Since there's no real bank behind the Creator's wallet balance at MVP, build a `POST /users/me/add-funds` endpoint (Creator-only) that increases `wallet_balance_paise` by a fixed demo amount, so Creators can actually test funding escrow without a real payment method on file yet. Clearly label this in the UI as a demo/test action, not a real deposit, matching the honest tone from the earlier planning docs — this should not be presented as if it were a real payment method.

**Acceptance criteria:**
- [ ] Add Funds is clearly and honestly labeled in the UI as a demo top-up, not a real payment
- [ ] Wallet balance updates immediately in the UI after a successful top-up
- [ ] Only the Creator role can call this endpoint

---

### WH-023: Row-level security policies (database layer)
**Priority:** 🔴 Must-have
**Depends on:** WH-002

**Description:**
Implement actual PostgreSQL Row-Level Security policies (not just application-level filtering) for `jobs`, `proposals`, and `payments`, matching the rules in WorkHive-Security-and-Access.md, Section 4 exactly. This is a second, independent enforcement layer on top of the application-level ownership checks already built in earlier tickets — the goal is that even a query with a missing `WHERE` clause in application code cannot leak another user's data.

**Acceptance criteria:**
- [ ] A raw SQL query run as a specific user's database role cannot return another Creator's jobs, even without an application-level filter
- [ ] The same holds for `proposals` (Workers see only their own; Creators see only proposals on their own jobs) and `payments`
- [ ] Existing application functionality (all prior tickets) continues to work correctly with RLS enabled — this ticket must not silently break earlier features
- [ ] `audit_log` remains unreadable by any non-admin role at the database level

---

### WH-024: Rate limiting
**Priority:** 🟡 Should-have
**Depends on:** WH-004

**Description:**
Add rate limiting middleware (per-user where authenticated, per-IP otherwise) on all mutating endpoints, especially `/auth/login` (per WorkHive-Security-and-Access.md, Section 5.1 — lockout after repeated failures) and the payment endpoints. Use the `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` env vars from the architecture doc.

**Acceptance criteria:**
- [ ] Repeated failed logins on one account trigger a temporary lockout with a clear "try again in X minutes" message
- [ ] Rate limit values are read from environment variables, not hardcoded
- [ ] Legitimate normal usage (a real person clicking through the app) never hits the rate limit accidentally

---

## Epic F — Should-have (fast-follow after launch)

### WH-025: WebSocket real-time events
**Priority:** 🟡 Should-have
**Depends on:** WH-011, WH-012, WH-013, WH-017

**Description:**
Add Socket.io to `apps/api` per the architecture doc's `sockets/index.ts` design — one room per authenticated user. Emit events for `job:posted`, `proposal:submitted`, `job:assigned`, `escrow:funded`, `payment:released`, targeted at the relevant user's room. Replace the polling-based UI updates from earlier tickets (WH-011, WH-019) with live socket-driven updates via TanStack Query cache invalidation.

**Acceptance criteria:**
- [ ] A new proposal appears in the Creator's proposal inbox within 1-2 seconds, with no page refresh
- [ ] A Worker sees "you've been hired" update live, with no page refresh
- [ ] Socket connections are correctly scoped per-user — one user's events never reach another user's browser
- [ ] Reconnection after a dropped connection works without requiring a manual page reload

---

### WH-026: In-app notification center
**Priority:** 🟡 Should-have
**Depends on:** WH-025

**Description:**
Add a notification bell with unread count in the dashboard nav (both roles), backed by the WebSocket events from WH-025 plus a `notifications` table to persist them across sessions.

**Acceptance criteria:**
- [ ] Unread count is accurate and updates live
- [ ] Clicking a notification navigates to the relevant job/proposal
- [ ] Notifications persist and are marked read correctly across a page refresh

---

### WH-027: Email notifications (Resend integration)
**Priority:** 🟡 Should-have
**Depends on:** WH-025

**Description:**
Wire the triggers listed in WorkHive-Frontend-Specification.md, Section 2.4 (email verification, hired, payment released, new pitch) through a BullMQ-queued `notification.service.ts`, so a slow/down email provider never blocks the actual job/payment action it describes.

**Acceptance criteria:**
- [ ] Each of the four listed triggers sends a correctly templated email
- [ ] Simulating an email provider outage does not block or fail the underlying action (hire, fund, release, pitch)
- [ ] Every emailed event is also independently visible in-app (audit_log/notification), per the "email is never the only record" rule

---

### WH-028: Saved jobs and saved searches
**Priority:** 🟡 Should-have
**Depends on:** WH-016

**Description:**
Let a Worker save individual jobs and save a filter combination (skill + budget range) as an alert. Alerts don't need real-time push at this stage — a daily digest via WH-027's email pipeline is sufficient.

**Acceptance criteria:**
- [ ] Saved jobs persist and are viewable in a dedicated tab
- [ ] A saved search correctly matches new jobs posted after it was saved
- [ ] Removing a saved job/search works correctly and immediately

---

## Epic G — Nice-to-have (explicitly deferrable)

### WH-029: Worker portfolio and case studies
**Priority:** ⚪ Nice-to-have
**Depends on:** WH-015

**Description:** Add portfolio entries (image, description, outcome) to the Worker profile, visible to Creators reviewing proposals.

**Acceptance criteria:**
- [ ] A Worker can add/edit/remove portfolio entries
- [ ] Portfolio entries are visible on the public profile view Creators see when reviewing a pitch

---

### WH-030: Milestone-based payments
**Priority:** ⚪ Nice-to-have
**Depends on:** WH-012, WH-013

**Description:** Extend the escrow model to support splitting a job's budget into multiple milestones, each funded and released independently, per WorkHive-Project-Plan-Enhanced.md, Section C.

**Acceptance criteria:**
- [ ] A job can be created with 2+ milestones, each with its own amount, summing to the total budget
- [ ] Each milestone follows the same escrow → deliver → release flow independently
- [ ] Partial job completion (some milestones paid, others not) is correctly reflected in status and payment history

---

### WH-031: Sliding platform fee
**Priority:** ⚪ Nice-to-have
**Depends on:** WH-023

**Description:** Reduce the platform fee percentage for repeat Creator-Worker pairs based on cumulative billings between them, per WorkHive-Project-Plan-Enhanced.md, Section E.

**Acceptance criteria:**
- [ ] Fee percentage correctly decreases according to a documented, testable formula as billings between a specific pair accumulate
- [ ] The fee shown in the release confirmation modal always reflects the actual rate that will be charged

---

### WH-032: Multiple withdrawal methods
**Priority:** ⚪ Nice-to-have
**Depends on:** WH-020

**Description:** Add a second real payout method beyond bank transfer (e.g. UPI-only payout, if not already the default) and let a Worker choose/manage their preferred method.

**Acceptance criteria:**
- [ ] A Worker can add and select between at least two payout methods
- [ ] Withdrawals correctly route to the selected method
- [ ] Changing the default method doesn't affect already-initiated withdrawals
