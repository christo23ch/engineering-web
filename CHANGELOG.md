# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has **not** cut a numbered software release yet (`package.json`
version `0.0.0`); entries below track the documentary and interface milestones.
The authoritative decision record is `docs/PROJECT_BIBLE.md` (SSOT); this log
never overrides it.

## [Unreleased]

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
