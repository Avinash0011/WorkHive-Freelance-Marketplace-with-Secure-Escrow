# Product Requirements Document: WorkHive

**Status:** Draft v1.0
**Owner:** Product
**Last updated:** July 19, 2026

---

## 1. Summary

WorkHive is a two-sided freelance marketplace built for the Indian market, connecting **Creators** (people and businesses who need work done) with **Workers** (freelancers who do the work). A Creator posts a job with a clear scope and budget in ₹, Workers pitch for it, the Creator hires one, funds the payment into escrow, the Worker delivers, and the Creator releases payment — with the platform taking a small fee on release.

The core promise to both sides: **your money or your work is never at risk mid-transaction.** A Creator's money is only ever charged once and held until they approve the work. A Worker only starts real work once payment is provably locked in.

---

## 2. Problem statement

**For Creators (people who need work done):** Hiring a freelancer off WhatsApp groups, Instagram, or word-of-mouth means no accountability if the work is late, wrong, or never delivered — and no easy way to compare multiple people for the same job. Existing global platforms (Upwork, Fiverr) are built around USD, charge international transaction fees, and have review/dispute systems tuned for a US/EU user base.

**For Workers (freelancers):** Getting paid is the single biggest source of anxiety in freelance work in India — chasing clients for payment, accepting partial advances on trust, or doing full work upfront with no guarantee. There's no simple, INR-native way to prove "the client has already put the money aside for this job" before starting.

**The shared problem WorkHive solves:** neither side currently has a way to establish trust *before* work starts, in Indian rupees, without going through a foreign platform's currency conversion and fee structure.

---

## 3. Who this is for

| Persona | Description | Primary need |
|---|---|---|
| **The Creator** | Small business owner, startup founder, or individual who needs a discrete piece of work done (a logo, a landing page, a set of product descriptions) and doesn't have or want a full-time hire | Post a job, compare candidates, hire with confidence, only pay for what's actually delivered |
| **The Worker** | Freelance designer, developer, writer, or marketer — often working with several clients at once, frequently outside major metros | Find real, paying work; know the money is real before starting; get paid reliably and quickly once done |

Both personas are assumed to be **first-time or occasional users of a formal freelance platform** — not power users migrating from Upwork. Onboarding needs to explain the model (post → pitch → hire → escrow → deliver → pay), not assume it's already understood.

---

## 4. Goals and non-goals

**Goals for v1:**
- Let a Creator post a job and receive pitches from Workers, in under 5 minutes, no assistance needed.
- Let a Worker find and pitch for relevant jobs without needing an existing profile/portfolio built out.
- Guarantee that once a Creator hires someone, no other Worker can simultaneously "also" be hired for the same job (no double-booking).
- Guarantee that a Worker never has to start delivering work before the Creator's payment is confirmed as held (escrow).
- Make the platform's fee fully visible before either side commits — no surprise deductions.

**Non-goals for v1** (see Section 8 for the full explicit-cut list):
- Not trying to replicate every Upwork feature.
- Not building for hourly/time-tracked work — fixed-price jobs only.
- Not building international payments — INR only, India only.
- Not building a full dispute-resolution/admin system in the first release.

---

## 5. Core features — Must-have vs Nice-to-have

### Must-have (v1 / MVP)

| Feature | Why it's must-have |
|---|---|
| Public home page explaining the model | Nobody signs up for something they don't understand in 10 seconds |
| Signup/login with role selection (Creator or Worker) | The entire product forks into two different dashboards from this one choice |
| Job posting (title, description, budget in ₹, deadline, required skills) | The Creator's core action — without it there's nothing to pitch for |
| Browse/search open jobs | The Worker's core action — without it there's nothing to find |
| Submit a pitch (bid amount + message) on a job | The Worker's way of competing for work |
| Hire a Worker from the pitch list | The Creator's core decision point |
| **Single-hire guarantee** — hiring one pitch automatically closes the job to further pitches and rejects the rest | Prevents the platform's worst trust failure: two Workers both believing they got the job |
| Fund escrow (₹ moved from Creator's balance, held by platform) | The trust mechanism that makes the Worker willing to start |
| Submit delivery (Worker marks work as done, with a note/link) | Signals the job is ready for review |
| Release payment (Creator approves, funds move to Worker minus platform fee, fee shown up front) | Completes the transaction — this is the moment of value exchange |
| Transaction history for both roles | Both sides need a record of what was paid/received and when |
| Basic two-way review after payment | Builds the trust signal that makes the second transaction easier than the first |

### Nice-to-have (fast-follow, not required to launch)

| Feature | Why it can wait |
|---|---|
| In-app messaging between Creator and Worker | Useful, but email/WhatsApp can bridge the gap for a v1 launch |
| Saved jobs / saved searches with alerts | Retention feature, not an activation feature — matters once there's a real job feed to search |
| Worker portfolio / case studies on profile | Improves match quality but isn't required for the first transaction to happen |
| In-app notification center / notification bell | Nice UX polish once the core loop is proven |
| Milestone-based payments (splitting a job into stages) | Real need for larger jobs, but fixed-price-in-one-shot is enough to validate the model |
| Sliding platform fee (lower fee for repeat Creator-Worker pairs) | A retention/pricing lever to test after there's usage data to test it against |
| Multiple withdrawal methods for Workers | One reliable payout method is enough at launch |

---

## 6. User flow, start to finish

### 6.1 Creator flow
1. Lands on home page → clicks **"I want to hire"**
2. Signs up, chooses Creator role
3. Lands on Creator Dashboard → clicks **Post a Job**
4. Fills in title, description, budget (₹), deadline, skills required → publishes
5. Job appears in the Worker-facing job feed; pitches start arriving
6. Reviews pitches (bid amount + message) in the job's proposal inbox
7. Clicks **Hire** on one pitch → all other pitches for that job are automatically declined, job closes to new pitches
8. Clicks **Fund Escrow** → ₹ is deducted from Creator's balance and held by the platform
9. Waits for the Worker to submit delivery
10. Reviews the delivered work → clicks **Release Payment**, sees the fee breakdown, confirms
11. Leaves a review for the Worker
12. Views the full transaction in **Payments** history

### 6.2 Worker flow
1. Lands on home page → clicks **"I want to work"**
2. Signs up, chooses Worker role, adds headline + skills
3. Lands on Worker Dashboard → clicks **Browse Jobs**
4. Searches/filters open jobs by skill or budget
5. Opens a job, clicks **Send a Pitch**, submits a bid amount and message
6. Tracks pitch status in **My Proposals** (pending / accepted / rejected)
7. Gets hired → job appears in **My Contracts**, waits for escrow to be funded
8. Once escrow is funded, begins work
9. Clicks **Submit Delivery** with a note/link when done
10. Waits for the Creator to release payment
11. Once released, sees the payout land in wallet balance, minus platform fee (visible breakdown)
12. Leaves a review for the Creator
13. Withdraws earnings; views history in **Earnings**

---

## 7. MVP definition

The MVP is the smallest version of WorkHive where a Creator and a Worker can complete one full transaction, unassisted, end to end:

**Post → Pitch → Hire (single-hire guaranteed) → Fund escrow → Deliver → Release payment (fee visible) → Review**

Everything in the Must-have table above is in scope. Everything in Nice-to-have is explicitly deferred. If a feature doesn't sit on the critical path of that one sentence above, it's not in the MVP — including messaging, portfolios, saved searches, and milestone payments.

**MVP is done when:** a real Creator can post a real job, a real Worker can find it, pitch, get hired, get paid, and both walk away trusting the platform enough to use it again — without needing a support conversation to get there.

---

## 8. Explicitly NOT building in v1

| Cut | Reasoning |
|---|---|
| Hourly contracts + time tracking ("Work Diary") | The single most expensive feature to build well (screenshots, activity tracking, privacy handling); fixed-price validates the core model without it |
| Milestone-based payment splitting | Adds real complexity to the escrow logic; a single fixed-price release is enough to prove the trust mechanism |
| Dispute resolution / admin moderation console | A "raise a dispute" button with nobody to resolve it is worse than not having it — build this as a complete flow later, not half-built now |
| ID verification / KYC | Needs a third-party verification provider and real compliance work; not required to validate the core loop |
| In-app messaging | Workers/Creators can coordinate off-platform for v1; building chat well is a project of its own |
| Talent search (Creators browsing Worker profiles directly) | v1 is pitch-driven (Workers come to jobs), not search-driven (Creators go to Workers) — a smaller, more testable loop |
| Skill certifications/assessments | A trust-building feature best added once there's enough job volume to make certification meaningful |
| Agency/enterprise accounts, multi-seat billing | B2B sales surface, not core product — irrelevant until there's product-market fit with individual Creators |
| International payments / multi-currency | India-only, ₹-only, by design — this is a focus decision, not a technical limitation |
| Mobile app | Responsive web covers the MVP; a dedicated app is a post-PMF investment |

---

## 9. Success metrics

**Activation**
- % of signed-up Creators who post at least one job within 7 days
- % of signed-up Workers who send at least one pitch within 7 days

**Core loop health**
- % of posted jobs that receive at least one pitch within 48 hours
- % of jobs that reach "hired" status within 7 days of posting
- **Time from hire → escrow funded** (a proxy for Creator commitment/friction)
- **Time from escrow funded → delivery submitted** (a proxy for Worker responsiveness)
- % of escrowed jobs that reach "paid" status (completion rate — the single most important trust metric)

**Trust and repeat use**
- % of completed jobs with a review left by both sides
- Average rating given/received
- % of Creators who post a second job within 30 days of their first payment release
- % of Workers who get hired a second time within 30 days of their first payout

**Platform economics**
- Gross Marketplace Value (GMV) — total ₹ moved through escrow
- Take rate realized (platform fee revenue ÷ GMV)
- Average job value (₹)

A useful early red flag to watch: **jobs that get hired but never reach "escrow funded."** A gap there means Creators are hiring but hesitating to actually commit money — a sign the trust mechanism isn't landing.

---

## 10. Open questions for the team

- What's the actual starting platform fee (%), and does it differ by job value tier?
- What's the minimum viable payout method for Workers at launch — bank transfer only, or also UPI?
- Is there a minimum/maximum job budget for v1, to keep quality and expectations consistent?
- Do we need any lightweight identity check (even just verified phone number) before a Creator can fund escrow, to reduce fraud risk from day one?
