# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has **not** cut a numbered software release yet (`package.json`
version `0.0.0`); entries below track the documentary and interface milestones.
The authoritative decision record is `docs/PROJECT_BIBLE.md` (SSOT); this log
never overrides it.

## [Unreleased]

### CMS — Sanity integration complete (2026-07-14)

#### Added
- **Sanity Studio workspace** (`cms/`, DA-7 — self-contained deps): schemas
  for the six §28 entities (service, sector, caseStudy, article, teamMember,
  certification) + composition objects, honesty encoded as validation (§13.4
  metric budget 1–4, optional client for anonymised cases, mandatory image
  alt text per WCAG §20, icons restricted to the §7 registry, H6 warning on
  certifications). Schemas use local typed identity helpers so the ROOT test
  suite verifies them without the Studio installed (20 contract tests:
  schema ⇄ GROQ ⇄ zod); the workspace additionally typechecks them against
  real sanity v4 types and compiles them with @sanity/schema
  (`schema:check:local`).
- **DA-4 editorial workflow**: read-only `estadoEditorial`
  (borrador → en_revision → aprobado) driven by document actions; Sanity's
  Publish disabled until aprobado; state badges; live "Pendientes de
  revisión" desk queue. Role model: administrator/editor review+publish,
  custom `redactor` authors without Publish (Growth-plan reservation
  documented).
- **Preview**: "Open preview" resolves the §24 public route against
  `SANITY_STUDIO_PREVIEW_URL`; drafts perspective supported by the BFF
  client for the F2 protected preview deployment.
- **Publish webhook → rebuild (ADR-001 revalidation)**:
  `POST /api/internal/cms/webhook` verifies Sanity's HMAC signature
  (constant-time, ±5 min replay window) and POSTs the DA-3
  `DEPLOY_HOOK_URL`; 502 on hook failure hands retries back to Sanity. ISR
  documented as a provider-dependent optimization in docs/CMS.md — never a
  replacement for the rebuild.
- **Templates wired to CMS loaders** (frontmatter-only): servicios/[slug],
  index, contacto, proyectos/[slug], recursos/[slug] now load through
  loadServices/loadCases/loadArticles with the honest local fallback —
  byte-identical build without CMS. CASES_QUERY dereferences
  sector/services references (controlled vocabulary for the F2 filter bar).
- **docs/CMS.md**: full runbook — project setup, schemas, workflow, roles,
  preview, webhooks, revalidation/ISR, testing map, §38 variables.
- Bible §38 gained `CMS_WEBHOOK_SECRET` and `DEPLOY_HOOK_URL` (SSOT-first).

#### Fixed
- Outbox integration suite: injected clock re-anchored relative to the
  future (fixed calendar anchor failed once the wall clock passed it).

### Backend / BFF — built and tested (2026-07-14)

#### Added
- **Server kernel** (`src/server/`): §38 configuration contract (capability
  -based, zod; missing integrations degrade to client-safe 503s), structured
  JSON logging with recursive PII redaction and secret-key dropping, closed
  AppError taxonomy with HTTP mapping, endpoint kernel (request-id
  propagation, single exception→response boundary), body intake with 64 KiB
  cap for JSON + form encodings.
- **PostgreSQL layer** (Supabase EU, DA-5): `DbClient` seam (postgres.js with
  `prepare:false` for the transaction pooler ⇄ PGlite in tests), forward-only
  SQL migrations (leads, candidatures, consents with XOR constraint +
  pseudonymized IP, outbox_events, rate_limits), repositories,
  `npm run db:migrate` (deploy-time only).
- **Domain validation** (Spanish, zod): approved §13 form field names
  verbatim; GDPR consent must be actively granted; `servicio` checked against
  the real §24 taxonomy; honeypot semantics (fake-accept, never persist).
- **Durable rate limiting** (§17): fixed window in Postgres via one atomic
  upsert; pseudonymized client buckets; exact Retry-After; fail-open with
  logging.
- **Transactional outbox + retry worker (ADR-010)**: jobs written in the same
  transaction as the business row; FOR UPDATE SKIP LOCKED claiming with a
  visibility timeout; exponential backoff with jitter (30 s → 1 h cap);
  permanent-vs-transient settlement; dead-letter kept for audit/replay.
- **Brevo integration** (DA-2 CRM + DA-8 email): fetch-based client with the
  retry-policy error mapping; contact upsert (uppercase attributes); text-only
  transactional email; provisional-honest Spanish templates (no invented
  promises); topic→delivery handler registry (missing capability = transient).
- **Sanity read layer** (DA-7): GROQ over the canonical CMS_API_URL; queries
  matching the typed frontend interfaces field-for-field; zod-validated
  loaders with the content-honesty fallback (local sources; empty
  cases/articles) — the F2 wiring point for `getStaticPaths`.
- **API endpoints**: `POST /api/leads`, `POST /api/candidatures`,
  `GET /api/health`, `GET|POST /api/internal/outbox/process` (constant-time
  Bearer auth; scheduled by `vercel.json` cron per DA-3). Pipeline: honeypot →
  rate limit → validation → one transaction (subject + consent + outbox).
  Candidatures notify internally only — never the CRM (GDPR §21).
- **Platform**: `@astrojs/node` adapter — output stays `static`, only
  `/api/*` runs on-demand; Astro's CSRF origin check active. Bible §38 gained
  `OUTBOX_WORKER_SECRET` and `EMAIL_TO_INTERNAL` (SSOT-first) and
  `.env.example` was reconciled.
- **Testing**: real-SQL integration suites on PGlite (migrations,
  constraints, rate limit, outbox state machine, full endpoint flows,
  end-to-end drain through a faked Brevo) + API e2e smoke against the built
  server. Suite: 242 unit/integration + 50 e2e, all green.

### Interface layer — FRONTEND APPROVED (2026-07-09 → 2026-07-13)

#### Added
- **UI component library (LIBRARY APPROVED)** — 16 primitives/compositions in
  `src/components/ui/` per DESIGN_SYSTEM §11: Button (+ `inverted` variant),
  Input, Textarea, Select, Checkbox, Radio, Field shells/messages, Card, Badge,
  Alert, Modal (native `<dialog>`), Skeleton, Loading, Spinner, Icon system (§7).
  Public API barrels (`index.ts`) for components and `lib`. Zero-JS discipline:
  native `<details>`/`<dialog>`; the only client script is the Modal controller.
- **All §13 screens** (14 route files): Home (§13.1, RF-01/CU-01); service
  template ×6 (§13.2, RF-02); Portfolio index + case-detail template (§13.3/13.4,
  RF-03/04); Sobre nosotros (§13.5, RF-05); Recursos listing + article detail
  (§13.6, RF-12); LeadMagnet block (RF-13); Empleo (§13.7, RF-14); Contacto +
  gracias (§13.8, RF-06/07); legal template ×3 (§13.9, RF-08); 404/500 (§13.10);
  buscar (§13.10). Shared **Header** (sticky, §11.4) and **Footer** chrome.
- **IA assistant widget UI** (§11.7/§13.11, RF-15) — floating trigger + side
  panel + source-citation slot; **interface only, no backend/RAG logic**.
- **SEO layer** (Hardening 4, RF-11): Organization/BreadcrumbList/FAQPage JSON-LD,
  OpenGraph/Twitter cards, canonical URLs, `robots.txt`, sitemap with exclusions,
  `noindex` on search/thank-you screens.
- **Content honesty:** typed content sources (`services.ts` with 6 real services;
  `cases.ts`, `articles.ts` intentionally EMPTY; `legal.ts` placeholders) validated
  by fixture tests — no fabricated metrics, clients, testimonials, or certifications.

#### Changed
- Navigation audit (Hardening 2): canonical URLs, breadcrumbs, focus order,
  keyboard nav, skip link.
- Zero-JS prefetch hint for the primary CTA (Hardening 3).

#### Fixed
- Focus ring made bulletproof on dark surfaces via two-layer outline + halo
  (`data-surface="dark"`), meeting WCAG 1.4.11 / 2.4.11.
- Primary Button label now compiles to white (audit P1: token renamed to
  `--color-on-action` so the `text-on-action` utility emits CSS).
- `scroll-padding-top` reserved on `html` so anchored/focus targets clear the
  sticky header (WCAG 2.4.11).

### Governance — Phase 0 closed (2026-07-13)
- **Bible → v1.1.0.** Recorded the *Informe Final de Gobernanza*: DA-2…DA-10
  **ratified by committee proposal, pending single client ratification** (§49,
  with reservations/plan-B); DA-6 (IA scope/budget) elevated to require explicit
  client ratification. Hypotheses H1–H11 **triaged** (blocking / documentary
  confirmation / deferrable) — **none validated** (§44). Roadmap §46 annotated
  with interface-layer progress. Derived docs (`CLAUDE.md`, `README.md`,
  `docs/ROADMAP.md`) reconciled; `CHANGELOG.md` created.

### Infrastructure & scaffolding (2026-07-08)

#### Added
- Technical infrastructure (Phase 0 scaffolding): `package.json`, `tsconfig.json`
  (strict), `astro.config.ts`, ESLint + Prettier, Vitest, Playwright + `@axe-core`,
  commitlint + Husky, CI workflows (`build`/`lint`/`lighthouse`), `.env.example`
  (all Bible §38 variables).
- CODEOWNERS and professional PR template (P1 governance, Bible §29).
- Comprehensive `README.md` (project overview, setup, roadmap).

#### Changed
- **Migrated infra to Astro 7 + Tailwind CSS v4 (ADR-011, security-driven).**
  Tailwind is now CSS-first: design tokens live in `src/styles/globals.css`
  `@theme` (no `tailwind.config.ts`); Node ≥22.12.
- Applied infra audit lots A+B and safe hygiene.

### Documentation baseline (2026-07-07 → 2026-07-08)

#### Added
- `docs/PROJECT_BIBLE.md` adopted as the official **v1.0 SSOT** (49→50 sections:
  vision, 20 RF, architecture, IA policy, security, performance, accessibility,
  data model, 11 ADRs, 11 hypotheses, 10 decisions, self-audit).
- `docs/DESIGN_SYSTEM.md` derived from the Bible (tokens, ~30 components, screens,
  WCAG 2.2 AA).
- `CLAUDE.md` session context & continuation guide.
- `docs/PRODUCT_DISCOVERY_REPORT.md` (strategic, non-normative) + topic stubs
  (`ARCHITECTURE`, `DATABASE`, `API`, `UI_UX`, `IMPLEMENTATION_PLAN`,
  `CODING_STANDARDS`, `SECURITY`, `TESTING`, `ROADMAP`).
- Initial repository structure.

#### Changed
- Committee reviews hardened the Bible: traceability + cross-doc data-model fixes;
  development-readiness pass.
