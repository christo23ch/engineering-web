# CLAUDE.md — Session Context & Continuation Guide
**Version:** 1.1.0  
**Last Updated:** 2026-07-13  
**Status:** 🟢 Interface layer complete (FRONTEND APPROVED) · Phase 0 closed by governance · backend/CMS/IA + real content pending  
**Repository:** christo23ch/engineering-web  
**Branch:** claude/repo-structure-setup-9eg3lj  

---

## Executive Summary

This is a **professional engineering firm website** (Jamstack: Astro 7 + React islands + Tailwind CSS v4 + headless CMS + PostgreSQL/pgvector + Claude RAG). 

**Documentation Status:**
- ✅ PROJECT_BIBLE.md (**v1.1.0 oficial · SSOT**) — 50 sections covering vision, requirements (20 RF), architecture, IA policy, security, performance, accessibility, testing, deployment, risk taxonomy, **11 ADRs**, 11 hypotheses (triaged in v1.1), **10 decisions (DA-1 closed; DA-2…DA-10 ratified by committee proposal, pending single client ratification)**, internal consistency audit.
- ✅ DESIGN_SYSTEM.md (v1.0.0) — 15 sections implementing all UX/UI/responsive/accessibility directives from PROJECT_BIBLE with full traceability (every decision references [Bible §n]).

**Product Status (v1.1 — 2026-07-13):**
- ✅ **Technical scaffolding complete** (Astro 7 + Tailwind v4 CSS-first `@theme`, TypeScript strict, ESLint/Prettier, Vitest, Playwright + axe, CI workflows, `.env.example`).
- ✅ **UI component library complete and audited (LIBRARY APPROVED)** — 16 UI primitives/compositions in `src/components/ui/` (Button, Input, Textarea, Select, Checkbox, Radio, Field shells/messages, Card, Badge, Alert, Modal, Skeleton, Loading, Spinner, Icon) with public API barrels. Zero-JS discipline (native `<details>`/`<dialog>`); the only client script is the Modal controller.
- ✅ **All §13 screens + global chrome + SEO layer built (FRONTEND APPROVED)** — 14 route files (Home, service template ×6, portfolio index + case detail template, sobre-nosotros, recursos index + article detail, empleo, contacto + gracias, legal template ×3, buscar, 404, 500), Header + Footer, IA assistant widget UI, JSON-LD/OG/Twitter/canonical/robots/sitemap. Lighthouse perf/a11y/best-practices 100.
- ✅ **Governance closed (Phase 0)** — DA-2…DA-10 ratified by committee (pending client), H1-H11 triaged.
- ✅ **Backend/BFF built and tested (2026-07-14)** — `src/server/` kernel (§38 config contract, structured logging with PII redaction, AppError taxonomy), PostgreSQL layer (migrations + repositories, Supabase-pooler-ready, DA-5), Spanish zod validation on the approved form field names, durable Postgres rate limiting (§17), **transactional outbox + retry worker (ADR-010)**, **Brevo** CRM/email integration (DA-2/DA-8), **Sanity** read layer with honest local fallback (DA-7), endpoints `/api/leads` · `/api/candidatures` · `/api/health` · `/api/internal/outbox/process` (Bearer + Vercel cron, DA-3). Pages stay 100 % SSG (Node adapter; only `/api/*` is on-demand). Operational as soon as vendor credentials exist.
- ✅ **Sanity CMS integration complete (2026-07-14)** — Studio as its own workspace (`cms/`: schemas for the six §28 entities with honesty-encoding validation, DA-4 two-level workflow with publish gated on approval + review queue + badges, role model incl. custom `redactor`, "Open preview" route resolution), §13 templates wired to the CMS loaders (byte-identical build without CMS — honest fallback), signed publish webhook → deploy hook → SSG rebuild (ADR-001; ISR documented as a DA-3 optimization, not architecture), drafts perspective ready for F2 preview. Runbook: `docs/CMS.md`. Awaits only a real Sanity project (client ratification of DA-7).
- ✅ **RAG / IA assistant backend built and tested (2026-07-14, F2)** — full pipeline on pgvector (ADR-004): deterministic chunker, **Voyage** embeddings (DA-10, 512-dim) with idempotent indexing (`npm run rag:index`) + threshold retrieval, **Claude** via BFF proxy (ADR-005), RAG-anchored prompt + citation engine enforcing the **strict no-hallucination + mandatory-citation policy** (§16, incl. prompt-injection guardrails), **DA-6 fail-closed budget** (durable ledger + hard-stop: with no ratified budget it refuses and spends nothing), durable answer cache, honest fallback, observability (`ai_events`), endpoint `/api/ia/consulta`. Runbook: `docs/AI.md`. **Inert by design until the client ratifies DA-6** (budget + hard-stop) and vendor credentials exist. `src/server/{rag,ai}/`.
- 🔶 **Content honesty:** templates are faithful but content sources (`cases.ts`, `articles.ts`) are intentionally EMPTY — no fabricated metrics/clients/testimonials/certifications. Real content lands in F2.
- ⏳ **Pending:** vendor sign-ups/credentials (client ratification of §49), wiring the approved zero-JS forms to `/api` (success-screen navigation), analytics/CMP, real content, deployment. IA is code-complete but gated on **DA-6 ratification**.

**Validation battery (all green):** `npm run typecheck` · `lint` · `format:check` · `test` (335 unit + integration tests, incl. real-SQL PGlite suites on **pgvector** + CMS contract tests) · `build` · `npm audit --omit=dev` (0 vulns) · `test:e2e` (10 Playwright specs / 52 tests, incl. API + IA smoke). Studio workspace: `cms/` `typecheck` + `schema:check:local` green. Deploy scripts: `db:migrate`, `rag:index`.

**Immediate Next Step:** wire the approved forms → `/api` endpoints + staging deploy, once the client ratifies §49 and vendor credentials exist (esp. **DA-6 IA budget** + DA-3 hosting/domain via H11). Backend + CMS + RAG code is ready and waiting on configuration only. PGlite pinned to 0.2.17 (ships the pgvector extension for real-SQL vector tests).

---

## Documentary Policy (OFFICIAL) — SSOT

- **`docs/PROJECT_BIBLE.md` is the single source of truth (v1.1 official).** Every other document — this `CLAUDE.md`, `README.md`, and all `docs/*` — **complements** the Bible and must **never** contain a different decision.
- **New decisions land in the Bible first** (as an ADR in §43 or an open decision in §49), and only then propagate to derived docs.
- On any discrepancy, **the Bible wins.** When you change a decision, update the Bible in the same change and reconcile the derived docs.
- Vendor/config names (e.g. environment variables) follow the **canonical catalog in Bible §38** verbatim.

---

## Critical Context — DO NOT LOSE

### Vision (§1-§3 Bible)
- **Client:** Spanish engineering firm, 30–80 people (H1), specialties: industrial, energetic, MEP, renewables (H2).
- **Differentiator:** Sustainability as primary value + premium technical reputation.
- **Model:** B2B with buying committees (H4), lead generation primary (H5).
- **MVP Goal:** Professional website (lead capture, project portfolio, thought leadership, team credibility).

### Architecture Locked In (ADR-001 through ADR-011)
1. **ADR-001:** Jamstack (SSG by default + rebuild-on-webhook; ISR is a provider-dependent optimization, not architecture — DA-3).
2. **ADR-002:** Astro (server components, zero JS by default) + React islands (TypeScript strict) + headless CMS. **Astro is definitive (DA-1 closed);** frontend framework revisable only before F4 if the private-area scope changes significantly.
3. **ADR-003:** Headless CMS (provider TBD in DA-7; candidates: Strapi, Sanity, Storyblok).
4. **ADR-004:** PostgreSQL + pgvector (EU-hosted; provider TBD in DA-5; Supabase, Neon, etc.).
5. **ADR-005:** RAG + Claude (Anthropic; via BFF proxy only; Haiku default, Sonnet/Opus for complex; **strict no-hallucination policy**; mandatory prompt-injection guardrails). Embeddings via a dedicated provider (DA-10, Voyage AI recommended) — Anthropic has no embeddings API.
6. **ADR-006:** RBAC: public, authenticated, admin (no guest checkout; lead forms only).
7. **ADR-007:** CI/CD via GitHub Actions (lint + unit + integration + build + axe + Lighthouse blockers).
8. **ADR-008:** Lead persistence: email + CRM webhook → PostgreSQL (CRM provider TBD in DA-2). Durable mechanism in ADR-010.
9. **ADR-009:** i18n design-first: ES now, EN in F3.
10. **ADR-010:** Outbox pattern + scheduled retry worker for durable lead delivery (in-memory retries don't survive serverless invocations).
11. **ADR-011:** Version baseline **Astro 7 + Tailwind CSS v4 + Node ≥22.12** (security-driven: Astro ≤5/6 carried 5 HIGH XSS/SSRF advisories fixed only in Astro 7; @astrojs/tailwind doesn't support Astro 7 → Tailwind v4 `@tailwindcss/vite`, CSS-first `@theme`). Architecture unchanged; tokens preserved.

### Design System (DESIGN_SYSTEM.md §1-§14)
- **8 Principles:** Clarity > creativity, data as aesthetic, single CTA per page, premium sobriety, performance-first, WCAG 2.2 AA by default, mobile-first, tokens-driven.
- **3-Tier Tokens:** Primitive (colors, spacing, typography) → Semantic (text-primary, text-secondary, text-muted, color-action, etc.) → Component.
- **Color Palette (⚠️ PROVISIONAL H10):** Blue 900/800/700/600/100/50 (technical/action), Green 700/600/50 (sustainability/success only), Gray 900/600/500/300/100/50 (text/borders), Red/Amber/White. All AA-verified.
- **Typography:** Inter variable (1 woff2 ~48kB), fluid scaling via clamp(), 60–75ch line length for technical prose.
- **Spacing:** 4px base scale (1/2/3/4/6/8/12/16/24/32), 12-column grid, 1200px max width, 68ch prose max.
- **Responsive:** 320px base, 640/768/1024/1280 breakpoints, mobile-first, no horizontal scroll, 44×44px touch targets min (mobile).
- **Icons:** Lucide (linear, 24×24 grid, 1.75px stroke, currentColor for contrast inheritance), 6 service icons (factory/zap/sun/layers/clipboard-check/box).
- **Interactive States:** default, hover, focus (2px blue-700 + 2px offset mandatory), active, disabled, loading, error, success.
- **Components (~30):** Button, Cards, Forms (visible labels), Navigation (header/mega-menu/footer/breadcrumbs), Content (banners/testimonials/accordions/timelines/tables/badges), Feedback (alerts/modals/skeletons/404/500), **IA assistant widget** (floating trigger, side panel, **mandatory source citation**).
- **Screens (11):** Home, ×6 Service pages, Portfolio, Case detail, About/Team/Certs, Resources, Employment, Contact, Legal, 404/500/search, IA assistant.
- **Accessibility:** WCAG 2.2 AA operativa. Contrast verified in tokens. Keyboard navigation. Visible labels. Meaningful alt text. reduced-motion honored. **axe CI blocker.** Manual audit before launch.

### Performance Budgets (Core Web Vitals, §20 Bible)
- LCP < 2.5s (P75 mobile)
- INP < 200ms (P75 mobile)
- CLS < 0.1 (P75 mobile)
- Verified in CI via Lighthouse.

### IA Policy (§16 Bible, RAG + Claude)
- **Constraint:** RAG-anchored to sources only. No hallucinations. Claude via BFF proxy exclusively (no client-side API keys).
- **Guardrails:** Mandatory source citation in UI. Refusal policy for out-of-domain questions. Tokens budget enforced per F2 scope (DA-6 pending).
- **Model Strategy:** Haiku by default (cost), Sonnet/Opus for complex technical Q&A.

### Data Model (11 Canonical Entities, §28 Bible — SSOT, source-of-truth per entity)
1. Servicio / Service — line of service (CMS)
2. Proyecto (caso de éxito) / Project — portfolio case, metrics, media (CMS)
3. Sector — market segment taxonomy (CMS)
4. Artículo/Recurso / Article — editorial content, blog, lead magnets (CMS)
5. Miembro del equipo / TeamMember — team person (CMS)
6. Certificación / Certification — company accreditations (CMS)
7. Lead — captured commercial contact (PostgreSQL + CRM)
8. Candidatura / Candidature — job application (PostgreSQL)
9. Consentimiento / Consent — GDPR consent record (PostgreSQL)
10. Documento de embedding / Embedding — content chunk + vector for RAG (PostgreSQL + pgvector)
11. Cliente / Proyecto-cliente *(futuro)* — private-area data (PostgreSQL)

> Note: KPIs/metrics (LCP, INP, CLS, CPL…) and audit/compliance logs are **operational
> telemetry** (§34 monitoring / §36 logs), not canonical domain entities — do not model
> them as such. Matches Bible §28 verbatim.

---

## Decisions Status (Bible §49 & §44)

### Locked Decisions (ADR-001 to ADR-011)
All 11 ADRs approved. Stack confirmed & definitive: Astro 7 + React islands + Tailwind CSS v4 + headless CMS + PostgreSQL + pgvector + Claude RAG (DA-1 closed; version baseline in ADR-011, Node ≥22.12).

### Governance-Closed Decisions (ratified by committee proposal — pending single client ratification)

**Infrastructure & Vendors (DA-1…DA-10 — canonical set in Bible §49; resolutions + reservations there are SSOT):**

| Decision | Resolution (committee proposal) | Status |
|----------|---------------------------------|--------|
| DA-1: Stack | **Astro definitive** (WordPress discarded) | ✅ Closed |
| DA-2: CRM provider | **Brevo** | 🟡 Ratified, pending client |
| DA-3: Hosting | **Vercel** (cron for retry worker; ties to domain/H11) | 🟡 Ratified, pending client |
| DA-4: Editorial workflow | **Approval gate (2-level)** | 🟡 Ratified, pending client |
| DA-5: PostgreSQL provider | **Supabase (EU)** — paid tier (free tier pauses) | 🟡 Ratified, pending client |
| DA-6: IA scope F2 | Features + max monthly budget + hard-stop | 🔴 **Requires client ratification** (elevated with H7) |
| DA-7: CMS provider | **Sanity** | 🟡 Ratified, pending client |
| DA-8: Email transactional | **Brevo** | 🟡 Ratified, pending client |
| DA-9: Analytics tool | **Plausible** | 🟡 Ratified, pending client |
| DA-10: Embeddings provider | **Voyage AI** (voyage-3-lite) | 🟡 Ratified, pending client |

> These are **committee proposals** logged in Bible §49 with reservations/plan-B; they fill the "provider TBD" holes in the existing ADRs (§43) and do **not** create new ADRs. They become effective on a single client ratification. Vendor names/env vars follow the canonical catalog in Bible §38 verbatim.

### 11 Hypotheses — Triaged (§44 Bible, v1.1) — ⚠️ NONE validated yet

Governance triage (operational only — does not mark any hypothesis as true):
- 🔴 **Block launch:** H6, H7, H8, H11
- 🟡 **Documentary confirmation only:** H2, H3, H4, H9, H10
- 🟢 **Deferrable:** H1, H5

| H | Claim | Triage | Validation Method |
|---|-------|--------|-------------------|
| H1 | Company size 30–80 people | 🟢 | Company info + org chart |
| H2 | Specialties: industrial, energetic, MEP, renewables | 🟡 | Service catalog + case studies |
| H3 | Sustainability as primary differentiator | 🟡 | Brand positioning, messaging |
| H4 | B2B, buying committee model | 🟡 | Sales process documentation |
| H5 | Lead generation as primary objective | 🟢 | Business metrics + target (leads/mo, cost/lead) |
| H6 | ISO 9001, 14001, 45001 certifications available | 🔴 | Compliance documentation |
| H7 | Team technical profile + budget for stack | 🔴 | Budget approval for services (CMS, hosting, IA…) |
| H8 | Client will own & author content | 🔴 | Content governance model + editor training |
| H9 | ES language now, EN in F3 | 🟡 | Approval for i18n design-first strategy |
| H10 | Accept provisional brand directives or provide manual | 🟡 | Brand guideline document (if not provisional) |
| H11 | Provide company name + tagline | 🔴 | Branding input |

---

## Repository Structure (built out)

```
engineering-web/
├── cms/                           Sanity Studio workspace ✅ (DA-7; own deps)
│   ├── schemas/                   6 §28 documents + objects (root-testable)
│   ├── workflow/ · desk/          DA-4 actions/badges · review queue
│   └── sanity.config.ts · preview.ts · README.md
├── docs/
│   ├── PROJECT_BIBLE.md           (v1.1.0, SSOT) ✅
│   ├── DESIGN_SYSTEM.md           (v1.0.0) ✅
│   ├── CMS.md                     Sanity runbook (setup/roles/webhooks/ISR) ✅
│   ├── ROADMAP.md                 (derived, defers to Bible §46)
│   ├── PRODUCT_DISCOVERY_REPORT.md (non-normative, review before F1)
│   ├── {ARCHITECTURE,DATABASE,API,UI_UX,IMPLEMENTATION_PLAN,
│   │    CODING_STANDARDS,SECURITY,TESTING}.md (topic stubs)
│   └── adr/                       (empty — ADRs live inline in Bible §43)
├── src/
│   ├── pages/                     14 route files (§13 screens) ✅
│   │   ├── index.astro · sobre-nosotros · empleo · buscar · 404 · 500
│   │   ├── servicios/[slug]   (×6 real services)
│   │   ├── proyectos/{index,[slug]}   (template; source empty)
│   │   ├── recursos/{index,[slug]}    (template; source empty)
│   │   ├── legal/[slug]       (×3 legal pages)
│   │   └── contacto/{index,gracias}
│   ├── components/
│   │   ├── ui/                    16 primitives + index.ts barrel ✅ (LIBRARY APPROVED)
│   │   ├── layout/                Header + Footer ✅
│   │   ├── content/              content blocks ✅
│   │   ├── seo/                   StructuredData + SocialMeta ✅
│   │   └── ia/                    IA assistant widget UI ✅ (no backend)
│   ├── pages/api/                 BFF routes ✅ leads · candidatures · health ·
│   │                              ia/consulta · internal/{outbox,cms}/… (on-demand)
│   ├── layouts/                   BaseLayout.astro ✅
│   ├── lib/                       api/ · content/ · db/ · seo/ · ui/ · utils/
│   ├── server/                    BFF ✅ (Bible §13) — config (§38) · logging
│   │   ├── http/                  errors · handler · respond · body
│   │   ├── db/                    client · migrations/ · repositories/
│   │   ├── validation/            leads · candidatures (zod, ES)
│   │   ├── rate-limit/            durable fixed window (§17)
│   │   ├── outbox/                topics · backoff · repository · worker ·
│   │   │                          handlers (ADR-010)
│   │   ├── integrations/          brevo/ (DA-2/DA-8) · sanity/ (DA-7)
│   │   ├── rag/                    F2 ✅ chunker · embeddings/voyage (DA-10) ·
│   │   │                          vector-store (pgvector, ADR-004) · retrieval
│   │   ├── ai/                     F2 ✅ claude (ADR-005) · prompt · citations ·
│   │   │                          budget (DA-6) · cache · assistant · telemetry
│   │   ├── email/                 provisional-honest templates
│   │   ├── services/              capture use-cases (ADR-008)
│   │   └── endpoints/             route factories (testable DI)
│   └── styles/globals.css         Tailwind v4 @theme design tokens ✅
├── tests/
│   ├── unit/                      unit tests (Vitest + Astro Container) ✅
│   ├── integration/               real-SQL suites on PGlite (+ pgvector) ✅
│   └── e2e/                       10 specs (Playwright + @axe-core + API/IA) ✅
│                                  (335 unit+integration / 52 e2e in total)
├── scripts/                       migrate.ts (db:migrate) · rag-index.ts (rag:index)
├── .github/workflows/            build.yml · lint.yml · lighthouse.yml ✅
├── astro.config.ts · tsconfig.json · package.json ✅ (+ @astrojs/node)
├── vercel.json                   outbox cron (DA-3) ✅
├── eslint.config.mjs · prettier.config.mjs · commitlint.config.mjs ✅
├── vitest.config.ts · playwright.config.ts · lighthouserc.json ✅
├── .env.example                  (all Bible §38 vars) ✅
├── CHANGELOG.md                  (Keep a Changelog) ✅
├── CLAUDE.md                     (This file, session context)
└── README.md                     ✅
```

> No `tailwind.config.ts`: Tailwind v4 is CSS-first (ADR-011) — tokens live in
> `src/styles/globals.css` `@theme`. `docs/adr/` stays empty on purpose: ADRs are
> inline in Bible §43; governance vendor selections are logged in §49, not new ADRs.

---

## Phase Roadmap (§46 Bible)

### **Phase 0: Discovery & Technical Scaffolding** (2 weeks)
**Status:** ✅ **Closed** — scaffolding complete; decisions ratified by committee (pending client); hypotheses triaged.

**Milestone Acceptance Criteria:**
- [~] Validate 11 hypotheses (H1-H11) — **triaged** (Bible §44 v1.1); none validated (require client)
- [~] Close 9 open decisions (DA-2…DA-10) — **ratified by committee proposal**, pending single client ratification (Bible §49 v1.1)
- [x] Initialize Astro project (package.json, tsconfig, astro.config)
- [x] Setup CI/CD pipeline (GitHub Actions: lint + build + axe blockers)
- [x] Create design tokens (Tailwind v4 `@theme` in `src/styles/globals.css`)
- [x] Create .env.example with all §38 variables
- [x] Create README.md (project overview + setup instructions)
- [x] Establish component library contract (UI barrels + render/variant tests)

**Deliverables:**
- ✅ PROJECT_BIBLE.md (v1.1) + DESIGN_SYSTEM.md
- ✅ Astro scaffold + full validation battery green
- ✅ CI/CD basics (lint, build, axe blockers)
- ✅ Developer onboarding (README + .env.example)
- 📋 Governance decision sheet (Informe Final de Gobernanza) → Bible §49; **awaiting client ratification**

### **Phase 1: MVP** (6 weeks, F0 dependencies resolved)
- ✅ Component library (16 UI primitives/compositions) from DESIGN_SYSTEM.md §11 — **LIBRARY APPROVED**
- ✅ All §13 screens (Home, 6 Service pages, Portfolio + Case detail, About, Recursos + article, Empleo, Contacto, Legal, 404/500, buscar) + Header/Footer + IA widget UI — **FRONTEND APPROVED**
- ✅ SEO fundamentals (sitemap, robots, canonical, JSON-LD/OG/Twitter via Schema.org)
- ✅ BFF endpoints (validation, durable rate limiting, honeypot, GDPR consent) + PostgreSQL persistence + transactional outbox/retry (ADR-008/010)
- ✅ Brevo CRM + transactional email delivery (DA-2/DA-8, via outbox)
- ✅ Headless CMS: full Sanity integration (DA-7) — Studio workspace (`cms/`, DA-4 workflow, roles, preview), templates wired to loaders (honest fallback), publish webhook → rebuild (ADR-001). Needs only a real Sanity project + content (`docs/CMS.md`)
- ⏳ Wire the approved zero-JS forms to `/api` (action + success screen)
- ⏳ Deploy to staging environment (Vercel per DA-3: swap adapter one line; cron in vercel.json; run `npm run db:migrate`)

**Deliverables:** Interface + backend code done and tested; vendor credentials, form wiring and deploy pending client ratification (§49). RAG/pgvector is F2 (DA-6).

### **Phase 2: Content & IA** (2 months)
- ✅ IA assistant widget **UI** (side panel, floating trigger, source-citation slot) + **full RAG backend** — chunker/Voyage embeddings/pgvector retrieval, Claude via BFF proxy, no-hallucination prompt + citation engine, DA-6 fail-closed budget, cache, honest fallback, telemetry, `/api/ia/consulta` (`docs/AI.md`). **Inert until DA-6 ratified + credentials.**
- ⏳ Load content: 6 Services, 12–20 Case studies, 20+ Articles, Team bios, 6 Certifications (sources currently EMPTY — no fabricated data)
- ⏳ Build the RAG index over real content (`npm run rag:index`) — pipeline done; awaits content + Voyage key
- ⏳ Setup monitoring (Core Web Vitals RUM, error tracking, logs; `ai_events` telemetry already emitted)
- ⏳ Email automation (lead follow-up sequences, transactional templates)

**Deliverables:** Content-rich site, IA assistant operativa, monitoring dashboards.

### **Phase 3: Automation & i18n** (2 months)
- i18n infrastructure (ES → EN routing, translated content, locale-specific CMS)
- Automation: lead scoring, qualification flows, CRM sync
- Advanced IA: multi-language Q&A, intent classification, fallback workflows
- Performance optimization (Core Web Vitals tuning, bundle analysis, cache strategies)

**Deliverables:** EN version live, full automation, performance P75 mobile targets met.

### **Phase 4: Private Area** (6+ months, post-MVP learning)
- Authenticated portal for clients (project tracking, document access, comms)
- Team collaboration tools (Slack/email integrations, notifications)
- Advanced analytics (lead pipeline, content performance, IA usage)

---

## Known Risks & Mitigations (§39-§42 Bible)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| 11 hypotheses unvalidated | 🔴 CRITICAL | Phase 0 validation gate; define clear closure criteria per hypothesis |
| CMS delay (provider eval, setup) | 🔴 HIGH | Decide DA-7 week 1 F0; use JSON fixtures if needed for demo |
| PostgreSQL + pgvector complexity | 🟡 MEDIUM | Prototype vector queries early (F0 spike); use managed service |
| IA guardrails & hallucinations | 🔴 CRITICAL | BFF proxy intercepts all AI calls; prompt + constraint testing in F1 |
| i18n scope creep | 🟡 MEDIUM | ADR-009: ES-only MVP; EN infrastructure in F3 (no content yet) |
| GitHub access (403 push error) | 🟡 MEDIUM | Resolved via: direct push retry, SSH key verification, or admin permission check |
| Brand directive (H10) gap | 🔴 CRITICAL | Ship MVP with provisional tokens; update on brand manual arrival (tokens only, no refactor) |
| Content author training | 🟡 MEDIUM | User manual for CMS + editorial workflow (part of DA-4 decision) |
| WCAG compliance (axe CI) | 🟡 MEDIUM | Automated testing in CI; manual audit before launch (§13 DESIGN_SYSTEM) |
| Core Web Vitals (LCP/INP/CLS) | 🔴 HIGH | Performance budget enforced in CI; Astro's SSG default helps; image optimization early |

---

## Technical Scaffolding (Phase 0 Start — Use Provisionals)

> ✅ **DONE (historical).** Everything in this section was executed and verified in v1.1
> (scaffolding, tooling, CI/CD, `.env.example`, README, component-library contract). It is
> retained as the record of how F0 scaffolding was scoped. The "Blocked Until Decisions
> Resolved" list below is still accurate — those items await client ratification (Bible §49).

### Can Start NOW (No Dependencies)

**1. Initialize Astro Project**
```bash
npm create astro@latest engineering-web -- --template minimal --typescript strict --no-git
```
Then:
- Setup `tsconfig.json` with `strict: true, skipLibCheck: true, resolveJsonModule: true`
- Create `astro.config.ts` with Tailwind, image optimization, sitemap, robots integrations
- Create `src/pages/`, `src/components/`, `src/layouts/`, `src/lib/` directories

**2. Setup Tooling**
- ESLint config (eslint-config-prettier, strict rules, a11y plugin)
- Prettier config (80-char line, tsx)
- Tailwind config with design tokens from DESIGN_SYSTEM.md §2-§5
  - Colors: primitive + semantic mappings
  - Spacing scale: 4px base
  - Typography: Inter variable + fluid scaling
  - Breakpoints: 320, 640, 768, 1024, 1280

**3. Create CI/CD Foundation**
- `.github/workflows/lint.yml` — ESLint + Prettier check (blocker)
- `.github/workflows/build.yml` — Astro build + axe-core accessibility scan (blocker)
- `.github/workflows/lighthouse.yml` — Lighthouse audit on core pages (warn, not blocker yet)

**4. Environment & Configuration**
- `.env.example` with all §38 variables:
  ```
  # Nomenclatura canónica: ver Bible §38 (SSOT). Estos nombres deben coincidir
  # exactamente con esa tabla; cualquier variable nueva se añade primero al Bible.

  # CMS
  CMS_API_URL=
  CMS_API_TOKEN=
  
  # Database
  DATABASE_URL=
  DATABASE_VECTOR_POOL_SIZE=
  
  # CRM
  CRM_API_BASE=
  CRM_API_KEY=
  CRM_WEBHOOK_SECRET=
  
  # IA / Claude (generation)
  AI_PROVIDER=anthropic
  AI_PROVIDER_API_KEY=
  AI_MODEL_DEFAULT=claude-haiku-4.5
  AI_MODEL_COMPLEX=claude-opus-4-8
  AI_MONTHLY_BUDGET=
  AI_BUDGET_HARD_STOP=true
  
  # Embeddings (DA-10 — Voyage AI recommended)
  EMBEDDINGS_PROVIDER=voyage
  EMBEDDINGS_API_KEY=
  EMBEDDINGS_MODEL=voyage-3-lite
  
  # Email
  EMAIL_PROVIDER=
  EMAIL_API_KEY=
  EMAIL_FROM=noreply@example.com
  
  # Analytics
  ANALYTICS_PROVIDER=
  ANALYTICS_ID=
  
  # Consent management (CMP)
  CMP_SITE_ID=
  
  # Anti-abuse (forms / IA)
  RATE_LIMIT_WINDOW=
  RATE_LIMIT_MAX=
  
  # Environment (host-agnostic — hosting is DA-3, undecided; no vendor-specific vars)
  SITE_URL=
  NODE_ENV=production
  ENVIRONMENT=
  ```
- `README.md` (project overview, stack, setup, contributing)

**5. Component Library Contract**
- Create `src/components/ui/` structure (buttons, cards, forms, etc.)
- Prepare Storybook or equivalent (optional for F0, required for F1)
- Document component props + stories aligned to DESIGN_SYSTEM.md §11

### Blocked Until Decisions Resolved (updated 2026-07-14 — backend built)

The CODE for all of these now exists (`src/server/`); what remains blocked is
**configuration** (vendor sign-ups + §38 credentials, on client ratification
of §49) — except the last two, which are still unbuilt:

- **CMS integration** (DA-7) — ✅ COMPLETE: Studio (`cms/`), DA-4 workflow,
  templates wired to loaders, publish webhook → rebuild; awaits only a real
  Sanity project + §38 credentials (runbook: `docs/CMS.md`)
- **PostgreSQL schema** (DA-5) — ✅ migrations + repositories built (incl.
  pgvector 0002); awaits a Supabase project + DATABASE_URL (`npm run db:migrate`)
- **CRM delivery** (DA-2) — ✅ Brevo upsert via outbox built; awaits CRM_API_KEY
- **Email transactional** (DA-8) — ✅ Brevo send + templates built; awaits
  EMAIL_API_KEY/FROM/TO_INTERNAL
- **IA assistant backend / RAG** (DA-6 + keys) — ✅ COMPLETE: full pipeline
  (`src/server/{rag,ai}/`), fail-closed on cost; awaits **client ratification
  of DA-6** (budget + hard-stop) + AI_PROVIDER_API_KEY/EMBEDDINGS_API_KEY +
  content indexing (`npm run rag:index`). Runbook: `docs/AI.md`
- **Analytics instrumentation** (DA-9) — ⏳ NOT built (needs consent flow/CMP)

---

## How to Resume Work

### For Incoming Claude Sessions
1. **Read this file first** (CLAUDE.md) to restore context.
2. **Read PROJECT_BIBLE.md (§1-§3)** for vision + strategy.
3. **Scan PROJECT_BIBLE.md (§43-§44)** for ADRs + hypotheses.
4. **Skim DESIGN_SYSTEM.md (§1-§5)** for design tokens + principles.
5. **Check this file's "Phase 0 Start" section** for immediate tasks.
6. **Follow the Decisions Status table** to unblock any pending work.

### For Pushing to Remote
Pushes to `claude/repo-structure-setup-9eg3lj` work (`git push -u origin <branch>`).
If a transient failure appears, retry with exponential backoff (2s, 4s, 8s, 16s).

### Code Style & Quality
- **TypeScript:** `strict: true`, no `any`, resolve all errors before commit
- **Linting:** ESLint + Prettier, enforced in CI
- **Commit messages:** Descriptive, reference Bible sections (e.g., "Add component library from DESIGN_SYSTEM §11")
- **Testing:** Unit tests for utilities, integration tests for BFF, accessibility tests (axe) for UI
- **Performance:** Core Web Vitals budgets enforced; no unnecessary JS
- **Accessibility:** WCAG 2.2 AA; tested with axe + manual review before launch

---

## Key File Cross-References

| File | Purpose | Key Sections |
|------|---------|--------------|
| PROJECT_BIBLE.md | SSOT: vision, requirements, architecture, policy | §1-§3 (vision), §8 (RF), §11-§14 (arch), §16 (IA), §28 (data model), §43 (ADRs), §44 (hypotheses), §46 (roadmap), §49 (decisions) |
| DESIGN_SYSTEM.md | Visual implementation of Bible directives | §1 (principles), §2-§5 (tokens), §11 (components), §13 (screens), §14 (accessibility) |
| CLAUDE.md | Session context + continuation guide | You are here |
| (TBD) docs/adr/ | Individual ADR documents (optional) | ADR-001 through ADR-011 (reference Bible §43) |
| (TBD) .env.example | Environment variables template | Reference Bible §38 |
| (TBD) README.md | Developer onboarding | Project overview, stack, setup, CI/CD, contributing |

---

## Success Criteria (End of Phase 0)

- ✅ PROJECT_BIBLE.md v1.1.0 + DESIGN_SYSTEM.md v1.0.0 (SSOT; v1.1 = governance content update, no arch change)
- ✅ Astro project initialized with TypeScript strict + ESLint + Prettier
- ✅ Design tokens (Tailwind v4 `@theme`) with all colors, spacing, typography
- ✅ CI/CD foundation (lint + build + axe blockers)
- ✅ .env.example complete with all §38 variables
- ✅ README.md documenting project + setup
- ✅ Component library contract + structure ready (LIBRARY APPROVED)
- ✅ **Bonus (beyond F0):** all §13 screens + chrome + SEO built and audited (FRONTEND APPROVED)
- 🟡 11 hypotheses **triaged** (none validated — require client)
- 🟡 9 open decisions **ratified by committee proposal** (pending single client ratification) + plan B (Bible §49)
- ✅ Git branch clean, atomic commits

---

## Notes for Next Session

**TL;DR:** Interface layer is **complete and audited** (LIBRARY APPROVED + FRONTEND APPROVED) and the **backend/BFF is built and tested** (kernel + Postgres/outbox/retry + rate limiting + Brevo + Sanity read layer + `/api` endpoints; 242 unit/integration + 50 e2e green; pages stay 100 % SSG). Governance closed Phase 0: DA-2…DA-10 ratified by committee (pending single client ratification), H1-H11 triaged (none validated). **Next: vendor credentials + form wiring + staging deploy (F1 close), then IA/RAG (F2)** — gated on client ratification (esp. DA-6 IA budget, DA-3 hosting/domain via H11).

**Content honesty (CRITICAL):** Templates are faithful but `cases.ts`/`articles.ts` are EMPTY and legal text is placeholder. Never fabricate metrics, clients, testimonials, certifications, or legal copy — real content arrives with the client in F2.

**Brand Gap (H10 = PROVISIONAL):** All color/type tokens marked ⚠️ PROVISIONAL. Once brand manual arrives, only re-define primitives + semantic mappings in the Tailwind v4 `@theme` block (`src/styles/globals.css`); components unchanged.

**Do NOT start backend without ratification:** DA-2…DA-10 are committee proposals, not client-signed. Wiring a specific CMS/CRM/DB vendor before ratification risks rework.

---

**End of CLAUDE.md v1.1.0**
