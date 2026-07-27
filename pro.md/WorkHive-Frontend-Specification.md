# Frontend Specification Document: WorkHive

**Status:** Draft v1.0
**Owner:** Design/Frontend
**Last updated:** July 19, 2026
**Companion docs:** WorkHive-PRD.md (product scope), WorkHive-Technical-Architecture.md (stack, schema)

---

## Part 1 — Design System

### 1.1 Design direction

WorkHive's visual identity should feel like **a working ledger, not a marketing template** — the product's whole value proposition is trust around money and status, so the UI should read as precise, transparent, and slightly structured, rather than soft and decorative. The name itself gives a real, non-arbitrary motif: a **hive** — structured, collective, many small cells adding up to one working system. That's the visual signature running through the product, used with restraint (hex-shaped structural accents, not hexagons plastered everywhere).

This deliberately avoids the two most overused "AI-generated startup" looks — a cream background with a terracotta accent, or a stark near-black page with one neon accent — in favor of a warmer, amber-toned palette paired with a structural, slightly technical type pairing that matches a product where every number needs to be trustworthy.

### 1.2 Color palette

| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#1B1F23` | Primary text, headings, high-contrast UI elements |
| `--color-wheat` | `#FBF3E3` | Primary page background (warm, not stark white) |
| `--color-white` | `#FFFFFF` | Card backgrounds, input backgrounds, elevated surfaces |
| `--color-amber` | `#E8A33D` | Primary accent — primary buttons, active states, key highlights |
| `--color-amber-deep` | `#B8722A` | Amber hover/pressed state, secondary emphasis, links |
| `--color-slate` | `#4A5560` | Secondary text, borders, placeholders, icons |
| `--color-slate-light` | `#D8DCDF` | Dividers, disabled states, subtle borders |
| `--color-signal-green` | `#2E8B57` | Success states — payment released, delivery accepted, "paid" status |
| `--color-alert-rust` | `#C1440E` | Error states, destructive actions, "rejected"/"failed" status |
| `--color-info-blue` | `#3E6B99` | Informational states — "pending," "awaiting action," neutral notices |

**Status color mapping (used consistently across job/proposal/payment badges):**

| Status | Color token |
|---|---|
| `draft`, `pending` | `--color-slate` on `--color-slate-light` background |
| `posted`, `submitted` | `--color-info-blue` on a tinted blue background |
| `assigned`, `escrowed` | `--color-amber-deep` on a tinted amber background |
| `paid`, `accepted`, `succeeded` | `--color-signal-green` on a tinted green background |
| `rejected`, `failed`, `cancelled` | `--color-alert-rust` on a tinted rust background |

Never rely on color alone for status — every status badge pairs color with a text label (accessibility requirement, Section 1.7).

### 1.3 Typography

| Role | Typeface | Notes |
|---|---|---|
| **Display** (H1, hero headline, marketing copy) | Space Grotesk | Geometric, structural — used sparingly, only on the home page and section headers, never in dense UI |
| **UI/Body** (everything inside the app: labels, buttons, paragraphs, forms) | Inter | Neutral, highly legible at small sizes, the right choice for a data-dense dashboard rather than a characterful display face |
| **Numeric/Mono** (₹ amounts, transaction IDs, timestamps in tables) | JetBrains Mono | Fixed-width digits so columns of money align visually — this matters more than it sounds for a ledger-style payments table |

**Type scale:**

| Token | Size / Line-height | Weight | Use |
|---|---|---|---|
| `--text-display-lg` | 48px / 56px | 600 (Space Grotesk) | Home hero headline |
| `--text-display-md` | 32px / 40px | 600 (Space Grotesk) | Section headers on home page |
| `--text-h1` | 28px / 36px | 600 (Inter) | Dashboard page titles |
| `--text-h2` | 20px / 28px | 600 (Inter) | Card/section titles |
| `--text-h3` | 16px / 24px | 600 (Inter) | Sub-section labels |
| `--text-body` | 15px / 24px | 400 (Inter) | Default body/UI text |
| `--text-small` | 13px / 20px | 400 (Inter) | Captions, helper text, timestamps |
| `--text-amount` | 18px / 24px | 500 (JetBrains Mono) | Money figures inline in cards |
| `--text-amount-lg` | 28px / 32px | 500 (JetBrains Mono) | Wallet balance, hero money figures |

### 1.4 Spacing and layout

**Base unit: 4px.** All spacing values are multiples of this — no arbitrary one-off values.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

**Layout rules:**
- Max content width on dashboard pages: `1200px`, centered, with `--space-5` (24px) side padding on mobile.
- Marketing/home page sections: max width `1120px` for text content, full-width for background treatments (hex pattern, hero band).
- Dashboard layout: fixed left navigation (`240px` wide, collapses to icon-only at `--breakpoint-md`) + fluid content area.
- Card grid: `minmax(280px, 1fr)` auto-fill for job listing cards — reflows naturally rather than a fixed column count.
- Vertical rhythm inside a card: `--space-4` (16px) between elements, `--space-5` (24px) card padding.

**Breakpoints:**

| Token | Value | Target |
|---|---|---|
| `--breakpoint-sm` | 480px | Large phones |
| `--breakpoint-md` | 768px | Tablets, sidebar collapses |
| `--breakpoint-lg` | 1024px | Small laptops |
| `--breakpoint-xl` | 1280px | Desktop |

### 1.5 Border radius and elevation

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Inputs, small buttons, badges |
| `--radius-md` | 10px | Cards, modals |
| `--radius-full` | 999px | Pills/status badges, avatar |
| `--shadow-card` | `0 1px 2px rgba(27,31,35,0.06), 0 1px 8px rgba(27,31,35,0.04)` | Default card elevation |
| `--shadow-modal` | `0 8px 32px rgba(27,31,35,0.18)` | Modal/overlay elevation |

Deliberately low, soft shadows — this is a trust-oriented product, not a playful one; heavy drop shadows read as less serious.

### 1.6 Component specs

#### Buttons

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| **Primary** | `--color-amber` | `--color-ink` | none | Main action per screen: "Post Job," "Hire," "Release Payment" |
| **Secondary** | transparent | `--color-ink` | 1px `--color-slate-light` | Secondary actions: "Save Draft," "Cancel" |
| **Ghost** | transparent | `--color-amber-deep` | none | Low-emphasis actions: "View Details," inline links |
| **Danger** | transparent | `--color-alert-rust` | 1px `--color-alert-rust` | "Withdraw Proposal," "Cancel Job" |
| **Disabled** | `--color-slate-light` | `--color-slate` | none | Any variant, disabled state — never just lowered opacity, which fails contrast checks |

- Height: `40px` default, `32px` compact (used inside table rows), `48px` large (hero CTAs only).
- Padding: `0 20px` default.
- Border radius: `--radius-sm`.
- **Hover:** primary darkens to `--color-amber-deep`; secondary/ghost gets a `--color-wheat` background tint.
- **Loading state:** button text is replaced with a small spinner, button keeps its exact width (no layout shift), and is disabled during the request — critical for payment actions, where a person must not be able to click "Release Payment" twice while the first request is in flight.
- **Focus state:** 2px `--color-amber-deep` outline, offset 2px — visible keyboard focus is mandatory, not optional, throughout.

#### Inputs

| State | Border | Background | Notes |
|---|---|---|---|
| Default | 1px `--color-slate-light` | `--color-white` | |
| Focus | 2px `--color-amber-deep` | `--color-white` | No default browser outline; this replaces it |
| Error | 2px `--color-alert-rust` | `--color-white` | Paired with a specific error message below the field, never color alone |
| Disabled | 1px `--color-slate-light` | `--color-wheat` | |

- Height: `40px`, padding `0 12px`, radius `--radius-sm`, `--text-body` for entered text.
- Label sits above the input, `--text-small`, `--color-slate`, `--space-2` gap.
- Helper/error text sits below, `--text-small`.
- **Currency input (special case)** — used for job budgets and proposal bids: `₹` prefix is a fixed, non-editable part of the field (not something the user can delete), input accepts only digits, and displays live thousands-separator formatting (`50,000`) as the person types, while the value stored/sent is the raw integer rupee amount converted to paise on submit — see Part 2, Section 2.3.

#### Cards

| Card type | Contents | Notes |
|---|---|---|
| **Job card** (browse feed) | Title, budget (mono), skill tags, deadline, Creator name + rating, status badge | Entire card is clickable to job detail; skill tags cap at 4 visible + "+N more" |
| **Proposal card** (Creator's proposal inbox) | Worker name + rating, bid amount (mono, prominent), pitch message (truncated, expandable), "Hire" primary button | The bid amount and Hire button are the two things that must be visible without scrolling inside the card |
| **Stat card** (dashboard overview) | Large mono number, small label below, optional trend indicator | Used for wallet balance, active contracts, total earned |
| **Transaction row** (payments history — table, not card) | Date, job title, type badge (escrow/release/refund), amount (mono, right-aligned), status badge | Right-aligned amounts so a column of numbers stays scannable, per standard ledger convention |

#### Modals

Used for: Post a Job, Send a Pitch, Hire confirmation, Fund Escrow confirmation, Release Payment confirmation, Leave a Review.

- Overlay: `rgba(27,31,35,0.5)`, click-outside-to-close **except** on any modal that represents an irreversible money action (Fund Escrow, Release Payment) — those require an explicit Cancel click, specifically so a stray click can't dismiss a payment confirmation mid-decision.
- Modal container: `--radius-md`, `--shadow-modal`, max width `480px` (forms) or `560px` (confirmation with fee breakdown).
- Structure: title (`--text-h2`) → body content → footer with Cancel (secondary) + primary action, right-aligned, primary action always on the right (consistent muscle memory across every confirmation in the app).
- **Money-moving modals always show the full breakdown before the action button** — e.g. Release Payment modal shows "Job total ₹45,000 → Platform fee ₹4,500 → Worker receives ₹40,500" directly above the confirm button, never on a separate screen after the fact.
- Animation: 150ms fade + slight scale-up on open, no bounce/spring easing — matches the restrained, trust-first tone.

### 1.7 Accessibility baseline (non-negotiable, not a stretch goal)

- All text meets WCAG AA contrast against its background (verified for `--color-amber` text-on-white specifically, since amber-on-white is the palette's biggest contrast risk — use `--color-amber-deep`, not `--color-amber`, for any text usage).
- Every interactive element has a visible keyboard focus state (Section 1.6).
- Status is always conveyed with text + icon, never color alone.
- All modals trap focus while open and return focus to the triggering element on close.
- Respect `prefers-reduced-motion` — the home page's decorative ticker and any hover animations should disable/simplify under this setting.

---

## Part 2 — Third-Party API & Integration Specification

### 2.1 Overview of external dependencies

| Service | Purpose | Required for MVP? |
|---|---|---|
| **Razorpay** | Payment gateway — funds escrow, releases payouts, handles refunds | Yes — this is the payment backbone |
| **Resend** (or SendGrid) | Transactional email — signup verification, "you've been hired," "payment released" | Recommended for MVP, not launch-blocking (see PRD Nice-to-have) |
| **Google Fonts** (Space Grotesk, Inter, JetBrains Mono) | Typography delivery | Yes, but self-host the font files rather than loading from Google's CDN at runtime — avoids an external network dependency on every page load and a third-party tracking surface |

Explicitly **not** integrated at MVP, flagged here so they're not accidentally half-built: KYC/ID verification provider (Onfido/HyperVerge — Phase 6 per the project plan), SMS/OTP provider, any social login provider.

### 2.2 Razorpay — payment gateway

**What it does for WorkHive:** Razorpay is the only service that actually touches real money movement. WorkHive's backend never stores card/UPI details directly — it calls Razorpay to create a charge (escrow funding) and to send a payout (payment release), and Razorpay handles the actual regulated money movement and compliance.

**Two Razorpay products are used:**
- **Razorpay Payments (Orders API)** — for the Creator funding escrow (money coming *into* the platform).
- **RazorpayX Payouts API** — for releasing money *out* to the Worker's bank/UPI. (Note: RazorpayX requires a separate current account and onboarding from standard Razorpay Payments — flag this to whoever sets up the business account, it's not automatic.)

#### 2.2.1 Funding escrow (Creator pays in)

| Step | Endpoint | What's sent | What's expected back |
|---|---|---|---|
| 1. Create an order | `POST /v1/orders` | `amount` (in paise), `currency: "INR"`, `receipt` (our internal `job_id`), `notes: { job_id, client_id }` | An `order_id` from Razorpay — this is what the frontend checkout widget needs to open |
| 2. Frontend opens Razorpay Checkout | (client-side SDK, not a direct API call) | `order_id`, our `VITE_RAZORPAY_KEY_ID` (public key) | User completes payment in Razorpay's hosted UI (card/UPI/netbanking) — WorkHive never sees the actual payment method details |
| 3. Verify the payment | `POST /v1/payments/{payment_id}/capture` (if not auto-captured) or signature verification of the client-returned response | `payment_id`, `order_id`, `razorpay_signature` | We independently verify the signature server-side using our `RAZORPAY_KEY_SECRET` before trusting that payment succeeded — **never trust the frontend's word alone that a payment went through** |
| 4. Record the result | — internal | — | On verified success: create a `payments` row (`type: escrow`, `status: succeeded`, `gateway_ref: payment_id`), update `jobs.status` to `escrowed` |

#### 2.2.2 Releasing payment (Worker gets paid out)

| Step | Endpoint | What's sent | What's expected back |
|---|---|---|---|
| 1. Create a payout | `POST /v1/payouts` (RazorpayX) | `account_number` (our RazorpayX virtual account), `fund_account_id` (the Worker's registered bank/UPI details, set up in a one-time "add payout method" step), `amount` (payout amount in paise, after platform fee subtracted), `currency: "INR"`, `mode: "UPI"` or `"NEFT"`, `purpose: "payout"`, `queue_if_low_balance: true` | A `payout_id` and initial `status` (`queued`, `pending`, `processing`) |
| 2. Confirm via webhook | (see Section 2.2.3) | — | Final `status` (`processed`, `reversed`, `failed`) arrives asynchronously — a payout is **not** confirmed complete at the moment of the API call, only initiated |
| 3. Record the result | — internal | — | On `payout.processed` webhook: update `payments` row to `succeeded`, update `jobs.status` to `paid`. On `payout.reversed`/`failed`: mark `payments` as `failed`, alert the founder/support — this is money that didn't reach the Worker and needs a human to look at it |

#### 2.2.3 Webhooks

| Event | What it means | What we do |
|---|---|---|
| `payment.captured` | An escrow-funding payment succeeded | Confirm/finalize the `escrowed` transition (used as a backstop even if the frontend-driven capture already ran — the webhook is the source of truth if the two ever disagree) |
| `payment.failed` | An escrow-funding attempt failed | Mark the `payments` row `failed`, leave the job in `assigned` status so the Creator can retry |
| `payout.processed` | A Worker payout completed | Finalize `jobs.status = 'paid'` |
| `payout.reversed` | A payout was sent but bounced back (e.g. bad bank details) | Mark `payments` as `failed`, notify both the Worker (to fix their payout details) and internal support |

**Mandatory security step:** every incoming webhook's `X-Razorpay-Signature` header is verified against `RAZORPAY_WEBHOOK_SECRET` before the payload is trusted or processed at all — an unverified webhook call must be rejected outright, since anyone who discovers the webhook URL could otherwise fake a "payment succeeded" event (this is also called out in the Security and Access Document).

### 2.3 Currency handling across the integration

- Razorpay's API expects and returns amounts in **paise as an integer** for INR — this happens to match WorkHive's own internal storage convention exactly (see architecture doc), so there's no unit conversion bug risk at the API boundary itself. The only conversion that happens is at the UI layer: paise → rupees for display (divide by 100), rupees → paise on form submit (multiply by 100), both handled in one shared utility function, never inlined ad hoc in multiple components.
- Platform fee is calculated **server-side only**, at the moment of release, from `PLATFORM_FEE_PERCENT` — the frontend displays the fee breakdown for transparency but never calculates or sends a fee value to the backend; the backend is the only source of truth for what the fee actually is.

### 2.4 Resend (transactional email)

**What it does for WorkHive:** sends the handful of emails that need to reach someone outside the app (they don't have the tab open) — email verification, "you've been hired," "payment released."

| Trigger | Endpoint | What's sent | What's expected back |
|---|---|---|---|
| Signup — verify email | `POST /emails` | `to`, `from`, `subject`, `html` (verification link with a time-limited token) | `id` of the sent email, used only for our own logging |
| Hired notification | `POST /emails` | `to` (Worker's email), templated HTML with job title and next step ("waiting on escrow") | same |
| Payment released | `POST /emails` | `to` (Worker's email), templated HTML with amount received, link to Earnings page | same |
| New pitch received | `POST /emails` | `to` (Creator's email), templated HTML with job title, link to proposal inbox | same |

- All emails are triggered from the backend's `notification.service.ts` (architecture doc, Section 3), queued through BullMQ rather than sent inline in the request — an email provider being slow or down should never block or fail the actual job/payment action it's describing.
- No email should ever be the *only* record of an event — every emailed event is also written to `audit_log` and visible in-app, so email deliverability issues never mean a user "loses" information about their own job or payment.

### 2.5 Fonts (Google Fonts, self-hosted)

- Space Grotesk, Inter, and JetBrains Mono font files are downloaded once and served from WorkHive's own frontend build (`apps/web/public/fonts/`), not loaded live from `fonts.googleapis.com` at runtime.
- **Why self-host rather than link the CDN directly:** removes a third-party network dependency from the critical rendering path (a Google Fonts outage shouldn't affect WorkHive's page load), and avoids sending every visitor's IP to Google before they've even logged in — a small but real privacy consideration worth getting right from day one rather than retrofitting later.

### 2.6 What's explicitly deferred, and why it's listed here anyway

| Future integration | Purpose | Why not now |
|---|---|---|
| KYC provider (Onfido/HyperVerge) | ID verification for Creators/Workers | Real compliance and cost overhead not justified until there's launch volume — noted in the PRD as a v1 non-goal |
| SMS/OTP provider | Phone verification, 2FA | Email verification covers the MVP fraud-prevention bar; add if fake accounts become a measured problem, not preemptively |
| Error tracking (e.g. Sentry) | Catch and alert on frontend/backend exceptions | Not a user-facing integration, but strongly recommended to add **before** launch even though it's not in this document's third-party API scope — flagging it here so it isn't dropped between documents |

Listing deferred integrations here, rather than leaving them out entirely, is deliberate: the moment one of these gets added, whoever builds it should extend this document rather than start a parallel, undocumented integration spec.
