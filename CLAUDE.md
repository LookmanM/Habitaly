# Habitaly — Project Context

This file gives you (Claude) the full context for the product we're building. Read it before generating any code.

---

## What we're building

**Habitaly** is a tenant rights documentation and action platform for NYC renters. A tenant takes a photo of a housing issue (mold, no heat, pests, leak, etc.), AI analyzes it, tells them their legal rights, helps them build evidence, generates a formal landlord notice, and — if they opt in — connects them with a tenant rights lawyer.

**One-line:** The app that makes sure your landlord can't ignore you.

**The MVP goal:** Get to the first lawyer lead sale. Everything we build serves that path.

---

## Who it's for

- Primary user: NYC renters in non-luxury housing, often low-income, who have housing issues but don't know their rights or how to document them.
- The product must feel trustworthy to a population that is rightly skeptical of apps collecting their data. Trust is the core design principle. Nothing happens to a user's data without explicit, separate, informed consent.

---

## Tech stack (do not deviate without asking)

- **Frontend:** Expo (React Native). One codebase for iOS + Android. Ship as a mobile web app (PWA) first for early users.
- **Backend / Auth / DB / Storage:** Supabase
  - Auth: OAuth (Google, Apple), email, and phone OTP — all via Supabase Auth
  - Database: Supabase Postgres
  - Photo storage: Supabase Storage
- **AI:** Claude API (model: `claude-sonnet-4-6`) for two jobs — (1) photo/vision analysis, (2) landlord letter generation
- **Payments (Sprint 3 only):** Stripe, pay-per-lead
- **Lawyer dashboard (Sprint 3 only):** Next.js web app, hosted on Vercel
- **Push notifications:** Expo Push

Do NOT introduce Firebase, raw AWS, a separate auth provider, or a custom server unless I explicitly ask. Use Supabase Edge Functions if server-side logic is needed.

---

## Design system (white minimalist — match exactly)

- **Background:** `#FFFFFF` · **Surface/cards:** `#FAFAFA` · **Text:** `#0A0A0A` · **Secondary text:** `#9A9A9A` · **Borders:** `#E6E6E6` / `#ECECEC`
- **Status colors (use sparingly):** Emergency/severity `#C1272D` on `#FCEEEE` · Notified `#1B6CA8` on `#EAF3FC` · Filed `#A86A0C` on `#FCF6E9` · Resolved `#13703A` on `#EBF8EF`
- **Font:** Inter throughout. Headings 600–700 weight, body 400–450, labels 500.
- **Buttons:** Primary = black bg, white text, ~52px tall, 14px radius. Secondary = white bg, 1px border, black text.
- **Cards:** white bg, 1px border, 18px radius, no shadows.
- **Signature element:** a thin black progress track at the top of every case card that fills based on case strength.
- **Nav:** bottom tab bar, max 3 tabs (Cases, New report [center +], Profile). No hamburger menu, no sidebar.
- **No dark mode in MVP. No gradients. No decorative icons. No animations except tab transitions.**
- The landlord letter screen is the ONE exception to Inter — render it in a serif (Georgia) so it reads as a legal document.

---

## Data model (Supabase Postgres)

### users
- id (uuid, pk), name, phone, email, unit_address, org_id (uuid, fk, nullable), created_at

### reports
- id (uuid, pk), user_id (fk), org_id (fk, nullable), status (enum: draft | pending | submitted_hpd | closed | matched_lawyer), report_type (enum: move_in_scan | issue_report), issue_type (mold | heat | pests | water | structural | electrical | other), location_tag (text), duration_tag (text), borough, building_type, ai_summary (text), ai_suggestions (jsonb), ai_case_strength (float 0-1), lead_eligible (bool), submitted_at

### media
- id (uuid, pk), report_id (fk), type (enum: photo | video | document), storage_url, ai_analysis (jsonb), uploaded_at

### case_updates
- id (uuid, pk), report_id (fk), update_text, status_change (nullable), created_at

### user_consents  (CRITICAL — legal foundation, build early)
- id (uuid, pk), user_id (fk), consent_type (enum: terms_of_service | data_sharing_lawyers | hpd_submission | marketing), granted (bool), version (text), recorded_at, revoked_at (nullable)

### audit_log  (append-only — never update rows)
- id (uuid, pk), actor_type (user | lawyer | org_admin | system), actor_id (uuid), action (text, e.g. report.submitted, lead.purchased, consent.revoked), target_type, target_id, metadata (jsonb), created_at

### leads  (Sprint 3)
- id (uuid, pk), report_id (fk), status (available | purchased | expired | opted_out), issue_preview (anonymized text), borough, price (decimal), max_purchases (int), listed_at

### lead_purchases  (Sprint 3)
- id (uuid, pk), lead_id (fk), lawyer_id (fk), purchased_at, amount_paid, contact_released_at, outcome

Add Row Level Security: users can only read/write their own rows in users, reports, media, case_updates, user_consents.

---

## Core screens (build in this order)

1. **Sign in** — OAuth buttons (Apple, Google, email) + phone OTP below a divider
2. **Home / Your cases** — list of case cards with progress track + status badge, grouped Active / Resolved. Bottom nav.
3. **New report** — photo upload + TAG SYSTEM (issue type, location, duration as tappable chips) + optional notes. The tags get passed to the AI as context.
4. **AI analysis** — shows the photo, the tags, identified issue + severity, and a case-strength score bar
5. **Rights explainer** — plain-English NYC housing rights for the detected issue type (from a static JSON lookup, not an AI call)
6. **Evidence checklist** — AI-suggested items to strengthen the case, with checkboxes + progress
7. **Landlord letter** — AI-generated formal notice (serif), with Copy and Share
8. **Case detail** — timeline of all actions on a case with status
9. **Lawyer connect (consent)** — opt-in screen showing exactly what will be shared, explicit confirm
10. **Profile** — unit info, privacy toggles (lawyer sharing on/off), account settings

---

## How the AI photo analysis should work

When a user submits a report, send Claude API the photo (as base64) PLUS the tags they selected (issue type, location, duration, notes). The tags are context that makes classification accurate. Claude returns JSON only:

```json
{
  "issue_type": "mold",
  "severity": "low | medium | high | emergency",
  "case_strength": 0.82,
  "evidence_checklist": ["wide-angle photo of full ceiling", "photo of water staining", "..."],
  "summary": "one-sentence plain-English description"
}
```

Store issue_type, ai_case_strength, ai_summary on the report and ai_suggestions (the checklist) as jsonb. Store the raw vision output in media.ai_analysis.

---

## Build sequence (8-week MVP, 2 people)

**Sprint 1 (wks 1-3) — core loop:** auth, photo upload + AI analysis, report builder, rights explainer (static JSON), landlord letter generator.

**Sprint 2 (wks 4-5) — retention:** case timeline, consent flow + lead creation, 2 push notifications.

**Sprint 3 (wks 6-8) — first sale:** lawyer dashboard (Next.js), Stripe pay-per-lead, contact release on payment.

Move-in scan, HPD auto-submission, org/nonprofit accounts, lawyer subscriptions, and data licensing are all OUT of the MVP.

---

## Rules for you (Claude) when building

- Keep components small and readable. This is a 2-person team — favor clarity over cleverness.
- Always use the design system colors and Inter font. Don't invent new colors.
- Never log or expose PII in client-side console or analytics.
- For anything touching consent or data sharing, write to user_consents AND audit_log.
- When unsure about a product decision, ask me rather than guessing.
- Don't build features marked OUT of MVP unless I ask.
- The landlord letter and rights content are NYC-specific. Don't generalize to other cities yet.

---

## Important disclaimer to bake into the product

Habitaly is not a law firm and does not provide legal advice. The rights explainer and letters are informational, based on NYC Admin Code and HPD guidelines. Surface this disclaimer in the rights and letter screens.
