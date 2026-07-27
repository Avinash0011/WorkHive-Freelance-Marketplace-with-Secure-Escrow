# Security and Access Document: WorkHive

**Status:** Draft v1.0
**Owner:** Security
**Last updated:** July 19, 2026
**Companion docs:** WorkHive-PRD.md (product scope), WorkHive-Technical-Architecture.md (stack and schema)
**Audience note:** This document is written so you don't need an engineering background to follow it. Where a technical term is unavoidable, it's explained the first time it's used.

---

## 1. The one-sentence security model

**A user should only ever be able to see or touch the data that belongs to them, and money should only ever move when both sides have taken a real, deliberate action — never automatically, never by accident, and never twice.**

Everything in this document is one of two things: a rule that enforces "this data belongs to this person," or a rule that enforces "this ₹ amount only moves once, on purpose."

---

## 2. Authentication — how we confirm someone is who they say they are

### 2.1 The method, and why

**Recommendation: email + password, using JWT (JSON Web Token) access and refresh tokens.**

In plain terms: when someone logs in, we check their password against a securely scrambled (hashed) version we stored — we never store the actual password anywhere. If it matches, we hand them two digital "passes":

- A **short-lived pass** (15 minutes) that they use for every action — post a job, hire someone, release a payment. Short-lived on purpose: if this pass is ever stolen, it stops working almost immediately on its own.
- A **long-lived pass** (7 days), stored in a way the person's browser can use but a malicious script running on the page cannot read, that's used only to quietly get a new short-lived pass when the old one expires — so people aren't asked to log in every 15 minutes.

**Why this fits WorkHive specifically, rather than something fancier:** WorkHive doesn't need social login (Google/Facebook) at launch — most early users won't mind a real email + password, and it keeps you from depending on a third party for something as core as "can people get into the app." It doesn't need biometrics or hardware keys — this is a marketplace for freelance work, not a banking app, and that level of friction would hurt signups more than it protects anyone. Passwords are hashed using a modern algorithm (bcrypt or argon2) that's deliberately slow to guess even if our database were ever stolen.

### 2.2 What this means in practice

- Every password is checked for basic strength at signup (minimum length, not on a list of known-breached passwords) — we tell the person why it's rejected, not just that it is.
- Failed login attempts are rate-limited (a person or a bot only gets a handful of tries per minute) so nobody can "guess" their way into an account.
- Logging out actually invalidates the long-lived pass on our side, not just deletes it from the browser — so a stolen device can't keep using it after someone logs out.
- **Before launch, add "verify your email" as a required step before a Creator can fund escrow or a Worker can get hired.** This is cheap to build and closes an easy fraud path (fake accounts with throwaway emails).
- **Recommended before launch, not strictly required at MVP:** a "reset your password" flow that requires clicking a time-limited link sent to the verified email — don't let someone reset a password just by answering a security question or similar guessable method.

---

## 3. User roles — what each role can and cannot do

WorkHive has two real user roles at launch, plus one implicit role every visitor has before signing up.

### 3.1 Visitor (not logged in)

| Can do | Cannot do |
|---|---|
| View the home page, "how it works," public marketing content | See any specific job's full detail, budget, or Creator's identity |
| See that jobs exist (e.g. a public count/teaser) | See any user's profile, wallet, proposals, or messages |
| Sign up | Post a job, send a pitch, or take any action that touches data |

### 3.2 Creator (Client)

| Can do | Cannot do |
|---|---|
| Post, edit, and close their **own** jobs | Edit or close a job posted by another Creator |
| View all pitches (proposals) sent to their **own** jobs | View pitches sent to another Creator's job |
| Hire one Worker per job, from their **own** job's pitches | Hire a Worker on someone else's job, or hire more than one Worker per job |
| Fund escrow for a job **they hired on** | Fund escrow for a job they don't own, or on behalf of another Creator |
| Release payment on a job **they hired on**, once the Worker has submitted delivery | Release payment before delivery is submitted, or release payment on someone else's job |
| View their own wallet balance and transaction history | View any other user's wallet balance or transaction history |
| Leave one review per completed job they were part of | Leave a review on a job they weren't part of, or more than one review per job |
| View a Worker's public profile (rating, skills, headline) before hiring | View a Worker's private data (email, wallet balance) |

### 3.3 Worker (Freelancer)

| Can do | Cannot do |
|---|---|
| View all open (`posted`) jobs | View jobs still in `draft` status (a Creator hasn't published yet) |
| Send one pitch per job | Send multiple pitches on the same job, or pitch on a job that's already `assigned`/`escrowed`/etc. |
| Withdraw their own pending pitch | Withdraw or edit a pitch that's already been accepted or rejected |
| View the status of their own pitches | View other Workers' pitches or bid amounts on the same job |
| Submit delivery on a job **they were hired for**, once escrow is funded | Submit delivery before escrow is funded, or on a job they weren't hired for |
| View their own wallet balance and earnings history | View any other user's wallet balance or earnings |
| Leave one review per completed job they were part of | Leave a review on a job they weren't part of |
| View a Creator's public profile (rating, jobs posted) before pitching | View a Creator's private data (email, wallet balance) |

### 3.4 A role WorkHive will need later, but not at launch: Admin

Not part of the MVP, but worth naming now so it's designed in from the start rather than bolted on:

| Can do | Cannot do |
|---|---|
| View any job, proposal, or payment record, for support/dispute purposes | Move money without a documented reason logged against a specific dispute case |
| Freeze a job's escrow if a dispute is raised | Silently edit a user's wallet balance without an audit trail entry |
| Suspend a user account for fraud/abuse | Impersonate a user to take actions "as" them without a clear, logged "acting on behalf of" flag |

**Why call this out now even though it's not being built yet:** the moment you have real money in escrow, you will eventually need a human who can look at a stuck job and resolve it. Designing the `audit_log` table (see architecture doc) from day one means that when Admin does get built, every action it needs to review is already being recorded.

---

## 4. Row-level security — who can see which rows in the database

"Row-level security" means: even though all Creators' jobs live in the same `jobs` table, a specific Creator's app requests should only ever be able to read or write the rows that belong to them — enforced by the database itself, not just by the application code being "well-behaved." This matters because application code has bugs; a database rule doesn't forget to check.

**Recommendation:** enforce these rules in two layers — in the application's query logic (every query is written to filter by the logged-in user's ID) *and* as actual Postgres Row-Level Security policies as a second, independent layer. If the application code ever has a bug that forgets a filter, the database still refuses the request. This "defense in depth" — two independent layers, so one bug doesn't equal one breach — is standard practice anywhere money is involved.

| Table | Rule, in plain English |
|---|---|
| `users` | A user can read and edit only their own row. Nobody can read another user's `email`, `password_hash`, or `wallet_balance_paise` directly — public profile data (name, headline, skills, rating) is served through a separate, deliberately limited view that excludes private fields. |
| `jobs` | A Creator can read and edit only jobs where `client_id` matches their own user ID. Any logged-in Worker can read jobs with `status = 'posted'` (the open job feed), but cannot read jobs still in `draft`. A Worker can read a job with any status if `freelancer_id` matches their own ID (their active contract) — even after it closes to new pitches. |
| `proposals` | A Worker can read and edit only proposals where `freelancer_id` matches their own ID. A Creator can read (but not edit) proposals where the proposal's `job_id` belongs to one of their own jobs — and only that job's proposals, never another Creator's. |
| `payments` | A user can read only payment records where the related job's `client_id` or `freelancer_id` matches their own ID. Nobody can insert or edit a `payments` row directly — these are only ever created by the backend's escrow/release logic, never by a direct user-facing request. |
| `reviews` | Anyone can read reviews (they're part of a public profile). Only the `reviewer_id` can create their own review, and only for a job they were actually part of, only after that job reaches `paid` status. |
| `audit_log` | No regular user (Creator or Worker) can read this table at all — it's an internal record, visible only to Admin. |

---

## 5. Error handling guide — what happens when things go wrong

For each failure point: what the user sees, what the system does, and why it's handled that way.

### 5.1 Login / authentication failures

- **Wrong password:** generic "Email or password is incorrect" message — deliberately not "that email doesn't exist" or "wrong password," because confirming which part was wrong tells an attacker which emails have accounts on WorkHive.
- **Too many failed attempts:** temporary lockout on that account (e.g. 5 minutes after 5 failed tries), with a clear message telling the person when they can try again — not a silent block that looks like the site is broken.
- **Expired session mid-action** (e.g. someone leaves a "Post a Job" form open for an hour): the refresh token quietly gets a new access token in the background if it's still valid; if the refresh token has also expired, the person is redirected to log in again **without losing their unsaved form data** — store the draft locally until login succeeds, then resubmit.

### 5.2 Hiring — two Creators/requests racing

- **What could go wrong:** a Creator double-clicks "Hire," or two requests somehow arrive at nearly the same moment.
- **What happens:** the database-level lock described in the architecture doc means only the first request actually succeeds. The second one is told, in plain language, "This pitch has already been responded to" — not a generic error, not a silent failure.
- **What the Worker sees:** the Worker whose pitch didn't get the (theoretical) double-hire simply sees their pitch as accepted, once, normally. They never see any sign that a race condition happened — that's invisible plumbing, not something to surface to a user.

### 5.3 Payment failures (funding escrow or releasing payment)

- **Gateway timeout or network drop:** the system retries automatically a small number of times (with increasing delay between tries). If it still fails, the payment record is marked `failed` and the Creator sees "We couldn't process this payment — your money was not moved. Try again, or contact support if this keeps happening." This message is important: a founder's instinct might be to say "please wait," but the person needs to know clearly that **no money moved**, so they don't panic-retry and worry about a double-charge.
- **Insufficient wallet balance to fund escrow:** clear, specific message — "Your balance (₹X) is short of the ₹Y needed for this job. Add funds to continue." — never a generic "payment failed."
- **Duplicate/retried request** (person double-clicks "Fund Escrow"): the idempotency key system (architecture doc, Section 5.2) means the second click returns the *same* result as the first, silently — the person just sees the button succeed once, as expected, with no double-charge possible.
- **Webhook failure** (Razorpay's confirmation call to our server fails or is delayed): the payment sits in `pending` status, and a background job checks back with Razorpay directly after a delay rather than waiting forever on a webhook that might never arrive — nobody's money should be able to get permanently "stuck" because one HTTP call failed.

### 5.4 Validation failures (bad input)

- Every form field has a specific, human-readable error next to the exact field that's wrong ("Budget must be at least ₹500," not "Invalid form") — errors are never batched into one generic banner at the top of the page.
- The backend re-validates everything the frontend already validated. The frontend's validation is for a good experience; the backend's validation is what actually protects the data, since a malicious user can bypass the frontend entirely.

### 5.5 Permission failures (someone tries to do something their role doesn't allow)

- A Worker who somehow gets a link to another Worker's proposal, or a Creator who tries to hire on a job they don't own, gets a plain "You don't have permission to do that" response — not a stack trace, not a raw database error, and importantly, not a message that confirms whether the thing they tried to access even exists (a job ID that isn't theirs should look the same whether it exists or not, to avoid leaking information about other users' data).

### 5.6 System-level failures (database or Redis unavailable)

- If the database is briefly unreachable, the person sees a calm "Something went wrong on our end — please try again in a moment," and the action is **not** silently treated as if it succeeded. Nothing money-related should ever default to "assume it worked."
- These events are logged and alerted on internally (this is a "the founder gets a notification," not "the user has to report it" situation) — you want to know about payment-path outages before your users tell you.

---

## 6. Edge cases to handle before launch

Grouped by how likely they are to actually happen in your first few weeks live — treat Group A as launch-blocking, Group B as fix-fast-if-it-happens, Group C as track-and-revisit.

### Group A — will happen in normal use, must be handled before launch

- **Double-click on "Hire," "Fund Escrow," or "Release Payment."** Covered by the hire-lock and idempotency design — verify with an actual test, don't just assume the code handles it.
- **A Worker withdraws a pitch after being hired, but before escrow is funded.** Decide the rule now: does the job revert to open for new pitches, or does the Creator have to manually reopen it? (Recommendation: auto-revert to `posted` and notify the Creator — don't leave the job silently stuck on a Worker who's no longer participating.)
- **A Creator tries to hire themselves** (posting a job and pitching on it with a second account, or a role misconfiguration). Block this explicitly at the hire step — check that `client_id !== freelancer_id`.
- **A job's deadline passes with no one hired.** Decide: does it auto-close, stay open indefinitely, or notify the Creator to take action? Silence here looks like a bug to users even if it's "working as designed."
- **Insufficient balance discovered mid-flow**, e.g. a Creator's balance drops (refund from another job) between seeing "Fund Escrow" and clicking it. Re-check the balance at the moment of the actual transaction, not just when the button was rendered.
- **A Creator cancels/closes a job after escrow is already funded but before delivery.** This needs a refund path back to the Creator — don't let money get stuck in escrow with no exit.

### Group B — plausible, especially as you scale past your first users

- **A user tries to sign up with an email that's already registered.** Clear message, with a link to log in or reset password instead — don't reveal *which* role that email is registered as beyond what's needed.
- **A Worker or Creator deletes their account while they have an active job in progress.** Decide the rule before it happens live: block deletion while there's an active contract, or freeze the job and notify the other party. Don't let an account deletion silently orphan money in escrow.
- **Currency rounding on the platform fee.** A 10% fee on an odd ₹ amount (e.g. ₹333) needs a documented, consistent rounding rule (round down, always) — write it down once so it's never "whatever the code happens to do."
- **A review submitted before a job is actually marked `paid`.** Block this at the database level (the row-level security rule in Section 4), not just in the UI, since UI-only rules can be bypassed.
- **Browser back button after a payment action.** Make sure resubmitting a stale form doesn't trigger a second charge — this is another case the idempotency key protects against, but it's worth testing this exact scenario by hand.

### Group C — lower probability early on, but worth a documented decision now rather than an emergency decision later

- **A dispute where the Worker says they delivered and the Creator says they didn't receive anything.** You don't need a full dispute system at launch (per the PRD), but you do need a documented manual process — even if it's "founder personally reviews the `audit_log` and messages both parties" — so it's not improvised the first time it happens.
- **A malicious user scripts repeated signups to spam fake jobs or pitches.** Rate limiting (already in the architecture doc) plus email verification cover most of this; consider a basic CAPTCHA on signup if it becomes a real problem, not before.
- **Replay attacks on the payment webhook** (someone captures and resends a valid-looking "payment succeeded" webhook call). Verify Razorpay's webhook signature on every call, and reject anything without a valid signature — already noted in the architecture doc, repeated here because it's genuinely one of the higher-stakes items on this list.
- **A minor (under 18) signs up.** Add a "you must be 18+" checkbox at signup now; a real age-verification system is not a launch requirement, but the terms-of-service acknowledgment should exist from day one so you're not retrofitting it later.
- **Tax/compliance questions** (GST on platform fees, TDS on freelancer payouts). This is a legal and accounting question, not a security one — flagging it here only so it doesn't fall through the cracks between documents. Get an actual accountant's sign-off before real money moves, separate from anything in this document.

---

## 7. The three things to not skip, if you only have time for three

If launch timelines compress and something has to give, these are the three items in this document that most directly determine whether "a user's money and data stay theirs":

1. **The hire-lock and idempotent payments** (Section 5.2, 5.3) — this is the difference between "a marketplace" and "a marketplace that occasionally charges someone twice."
2. **Row-level security as a real database rule, not just an application check** (Section 4) — one missed filter in application code should never mean one user can see another user's wallet.
3. **Backend re-validation of every input, and generic (not information-leaking) permission error messages** (Section 5.4, 5.5) — the frontend is for user experience, not security; assume anyone can bypass it entirely.
