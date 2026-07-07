# CLAUDE.md — Session Context & Continuation Guide
**Version:** 1.0.0  
**Last Updated:** 2026-07-07  
**Status:** 🟡 Ready for Phase 0 Technical Scaffolding  
**Repository:** christo23ch/engineering-web  
**Branch:** claude/repo-structure-setup-9eg3lj  

---

## Executive Summary

This is a **professional engineering firm website** (Jamstack: Astro + React islands + headless CMS + PostgreSQL + RAG). 

**Complete Documentation Status:**
- ✅ PROJECT_BIBLE.md (1,455 lines, v1.0.0) — 49 sections covering vision, requirements (20 RF), architecture, IA policy, security, performance, accessibility, testing, deployment, risk taxonomy, 9 ADRs, 11 hypotheses, 6 open decisions, internal consistency audit.
- ✅ DESIGN_SYSTEM.md (473 lines, v1.0.0) — 15 sections implementing all UX/UI/responsive/accessibility directives from PROJECT_BIBLE with full traceability (every decision references [Bible §n]).

**Current Deliverables:** Documentation + analysis complete. **Zero product code written yet.**

**Immediate Next Step:** Phase 0 Technical Scaffolding (approved by user to proceed with provisional directives).

---

## Critical Context — DO NOT LOSE

### Vision (§1-§3 Bible)
- **Client:** Spanish engineering firm, 30–80 people (H1), specialties: industrial, energetic, MEP, renewables (H2).
- **Differentiator:** Sustainability as primary value + premium technical reputation.
- **Model:** B2B with buying committees (H4), lead generation primary (H5).
- **MVP Goal:** Professional website (lead capture, project portfolio, thought leadership, team credibility).

### Architecture Locked In (ADR-001 through ADR-009)
1. **ADR-001:** Jamstack (SSG/ISR default, pre-render whenever possible).
2. **ADR-002:** Astro (server components, zero JS by default) + React islands (TypeScript strict) + headless CMS.
3. **ADR-003:** Headless CMS (provider TBD in DA-7; candidates: Strapi, Sanity, Storyblok).
4. **ADR-004:** PostgreSQL + pgvector (EU-hosted; provider TBD in DA-5; Supabase, Neon, etc.).
5. **ADR-005:** RAG + Claude (Anthropic; via BFF proxy only; Haiku default, Sonnet/Opus for complex; **strict no-hallucination policy**).
6. **ADR-006:** RBAC: public, authenticated, admin (no guest checkout; lead forms only).
7. **ADR-007:** CI/CD via GitHub Actions (lint + unit + integration + build + axe + Lighthouse blockers).
8. **ADR-008:** Lead persistence: email + CRM webhook → PostgreSQL (CRM provider TBD in DA-2).
9. **ADR-009:** i18n design-first: ES now, EN in F3.

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

### Data Model (11 Canonical Entities, §28 Bible)
1. Service (6 core offerings, ISO certs, sustainability metrics)
2. Project (portfolio cases, client logos, metrics, testimonials)
3. Sector (industrial, energetic, MEP, renewables, infrastructure)
4. Article (thought leadership, blog, resources)
5. Lead (form submissions, email, company, role, consent, origin)
6. Candidature (job applications, CV, screening)
7. Consentimiento (GDPR, email, cookies, privacy)
8. Embedding (pgvector index for RAG, chunked content)
9. TeamMember (bios, certs, specialities)
10. Metric (KPIs: LCP, INP, CLS, lead cost, conversion rate)
11. AuditLog (compliance, changes, access)

---

## Decisions Status (Bible §49 & §44)

### Locked Decisions (ADR-001 to ADR-009)
All 9 ADRs approved. Stack confirmed: Astro + React + headless CMS + PostgreSQL + pgvector + Claude RAG.

### Open Decisions (Blocking Development; Require Client/Direction Input)

**Infrastructure & Vendors (DA-1 to DA-6 + Extensions):**

| Decision | Options | Owner | Timeline |
|----------|---------|-------|----------|
| DA-1: Stack confirmation | Astro ✅ vs WordPress | ~Locked | F0 |
| DA-2: CRM provider | HubSpot vs Brevo vs Pipedrive vs custom | Client/CTO | F0 |
| DA-3: Hosting | Vercel vs Netlify vs Cloudflare Pages | Client/DevOps | F0 |
| DA-4: Editorial workflow | Direct publish vs approval gate | Product Owner | F0 |
| DA-5: PostgreSQL provider | Supabase vs Neon vs AWS RDS (EU) | DevOps | F0 |
| DA-6: IA scope F2 | Token budget, features, model routing | CTO | F0 |
| **DA-7: CMS provider** | Strapi vs Sanity vs Storyblok vs Contentful | Client/CTO | F0 |
| **Email transactional** | SendGrid vs Brevo vs Resend vs other | DevOps | F0 |
| **Analytics tool** | Plausible vs GA4 (with consent) vs PostHog | Product Owner | F0 |

### 11 Hypotheses Requiring Validation (§44 Bible)

| H | Claim | Validation Method |
|---|-------|-------------------|
| H1 | Company size 30–80 people | Company info + org chart |
| H2 | Specialties: industrial, energetic, MEP, renewables | Service catalog + case studies |
| H3 | Sustainability as primary differentiator | Brand positioning, messaging |
| H4 | B2B, buying committee model | Sales process documentation |
| H5 | Lead generation as primary objective | Business metrics + target (leads/mo, cost/lead) |
| H6 | ISO 9001, 14001, 45001 certifications available | Compliance documentation |
| H7 | Team technical profile + budget for stack | Budget approval for services (CMS, hosting, etc.) |
| H8 | Client will own & author content | Content governance model + editor training |
| H9 | ES language now, EN in F3 | Approval for i18n design-first strategy |
| H10 | Accept provisional brand directives or provide manual | Brand guideline document (if not provisional) |
| H11 | Provide company name + tagline | Branding input |

---

## Repository Structure (Initialized)

```
engineering-web/
├── docs/
│   ├── PROJECT_BIBLE.md           (1,455 lines, v1.0.0, SSOT) ✅
│   ├── DESIGN_SYSTEM.md           (473 lines, v1.0.0) ✅
│   ├── adr/                       (TBD: ADR files if needed)
│   └── .gitkeep
├── src/                           (Empty, ready for Astro scaffolding)
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   └── lib/
├── public/
├── assets/
├── config/
├── tests/
├── scripts/
├── .github/
│   └── workflows/                 (CI/CD pipelines TBD)
├── .vscode/
├── CLAUDE.md                      (This file, session context)
├── package.json                   (TBD)
├── tsconfig.json                  (TBD)
├── astro.config.ts                (TBD)
├── tailwind.config.ts             (TBD)
├── .env.example                   (TBD)
└── README.md                       (TBD)
```

---

## Phase Roadmap (§46 Bible)

### **Phase 0: Discovery & Technical Scaffolding** (2 weeks)
**Status:** ✅ Documentation complete. 🔶 Awaiting decisions/approvals.

**Milestone Acceptance Criteria:**
- [ ] Validate 11 hypotheses (H1-H11)
- [ ] Close 9 open decisions (DA-1 to DA-7 + email + analytics)
- [ ] Initialize Astro project (package.json, tsconfig, astro.config)
- [ ] Setup CI/CD pipeline (GitHub Actions: lint + build blocker)
- [ ] Create Tailwind config with design tokens
- [ ] Create .env.example with all variables
- [ ] Create README.md (project overview + setup instructions)
- [ ] Establish component library contract (Storybook or equiv.)

**Deliverables:**
- ✅ PROJECT_BIBLE.md + DESIGN_SYSTEM.md (complete)
- 📋 Answers to 11 hypotheses + 9 decisions
- 🔧 Astro scaffold (ready for component/page development)
- 🧪 CI/CD basics (lint, build, axe blockers)
- 📖 Developer onboarding (README + .env.example)

**Effort:** ~1 FTE week (scaffolding can proceed in parallel with decisions if using provisionals; see note below).

### **Phase 1: MVP** (6 weeks, F0 dependencies resolved)
- Implement component library (~30 components) from DESIGN_SYSTEM.md §11
- Build 11 screens (Home, 6 Service pages, Portfolio, Case detail, About/Team, Contact, Legal, 404/500, IA)
- Implement BFF serverless functions (form validation, CRM webhook, email, persistence)
- Wire PostgreSQL with RAG index (pgvector, chunking, retrieval pipeline)
- Wire headless CMS (content source for Services, Projects, Articles, Team)
- SEO fundamentals (sitemap, robots, structured data via Schema.org)
- Deploy to staging environment

**Deliverables:** Production-ready MVP, lead capture functional, admin dashboard mockup.

### **Phase 2: Content & IA** (2 months)
- Launch IA assistant widget (side panel, floating trigger, source citation UI)
- Load content: 6 Services, 12–20 Case studies, 20+ Articles, Team bios, 6 Certifications
- Train RAG index (chunk content, embed with pgvector, load to vector index)
- Setup monitoring (Core Web Vitals RUM, error tracking, logs)
- Email automation (lead follow-up sequences, transactional templates)

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
| Core Web Vitals (LCP/INP/CLS) | 🔴 HIGH | Performance budget enforced in CI; Astro's SSG/ISR default helps; image optimization early |

---

## Technical Scaffolding (Phase 0 Start — Use Provisionals)

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
  # CMS
  CMS_API_URL=
  CMS_API_TOKEN=
  
  # Database
  DATABASE_URL=
  DATABASE_VECTOR_POOL_SIZE=
  
  # CRM
  CRM_API_KEY=
  CRM_WEBHOOK_SECRET=
  
  # IA / Claude
  AI_PROVIDER=anthropic
  AI_API_KEY=
  AI_MODEL_DEFAULT=claude-haiku-4.5
  AI_MODEL_COMPLEX=claude-opus-4-8
  
  # Email
  EMAIL_PROVIDER=
  EMAIL_API_KEY=
  EMAIL_FROM=noreply@example.com
  
  # Analytics
  ANALYTICS_PROVIDER=
  ANALYTICS_ID=
  
  # Hosting
  VERCEL_DEPLOYMENT_URLS=
  ```
- `README.md` (project overview, stack, setup, contributing)

**5. Component Library Contract**
- Create `src/components/ui/` structure (buttons, cards, forms, etc.)
- Prepare Storybook or equivalent (optional for F0, required for F1)
- Document component props + stories aligned to DESIGN_SYSTEM.md §11

### Blocked Until Decisions Resolved

- **CMS integration** (DA-7) — scaffolds BFF handlers, awaits API spec
- **PostgreSQL + pgvector schema** (DA-5) — awaits host selection + connection string
- **CRM webhook routes** (DA-2) — awaits CRM choice + webhook docs
- **IA assistant backend** (DA-6 + API key) — awaits budget + provider confirmation
- **Email transactional setup** — awaits provider choice + API key
- **Analytics instrumentation** — awaits provider choice + consent flow

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
Current issue: 403 Forbidden on `git push -u origin claude/repo-structure-setup-9eg3lj`. Mitigations:
- Verify SSH key is loaded: `ssh -T git@github.com`
- Retry push with `-u` flag (exponential backoff: 2s, 4s, 8s, 16s delays)
- If still blocked, ask repo admin to check: GitHub App permissions, branch protection rules, user org access
- Fallback: create PR after push succeeds (if push succeeds, PR template search in `.github/pull_request_template.md`)

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
| (TBD) docs/adr/ | Individual ADR documents (optional) | ADR-001 through ADR-009 (reference Bible §43) |
| (TBD) .env.example | Environment variables template | Reference Bible §38 |
| (TBD) README.md | Developer onboarding | Project overview, stack, setup, CI/CD, contributing |

---

## Success Criteria (End of Phase 0)

- ✅ PROJECT_BIBLE.md v1.0.0 + DESIGN_SYSTEM.md v1.0.0 (locked, no changes)
- ✅ Astro project initialized with TypeScript strict + ESLint + Prettier
- ✅ Tailwind config with all design tokens (colors, spacing, typography)
- ✅ CI/CD foundation (lint + build + axe blockers)
- ✅ .env.example complete with all §38 variables
- ✅ README.md documenting project + setup
- ✅ Component library contract + structure ready
- ✅ 11 hypotheses validated (or explicitly deferred with mitigation)
- ✅ 9 open decisions closed (or documented as deferral + plan B)
- ✅ Git branch clean, commits squashed/organized, ready for PR

---

## Notes for Next Session

**TL;DR:** Documentation is locked in. Zero code yet. Ready for Phase 0 scaffolding using provisional directives. Awaiting 20 decisions/validations from client/CTO before Phase 1 MVP starts.

**Brand Gap (H10 = PROVISIONAL):** All color/type tokens marked ⚠️ PROVISIONAL. Once brand manual arrives, only re-define primitives + semantic mappings in Tailwind config; components unchanged.

**GitHub Push Issue:** Retry with SSH key verification; if 403 persists, ask admin to verify GitHub App + branch permissions for user.

**No Half-Measures:** Phase 0 scaffolding should be 100% complete (every config file, every token, every CI rule, every folder structure) before Phase 1 component work starts. This prevents refactoring later.

**Next Conversation Kickoff:** Ask user to confirm Phase 0 scaffolding is approved, then proceed with Astro init + CI setup without waiting for all 20 decisions. Use provisionals where needed (H10 tokens, DA-7 JSON fixtures).

---

**End of CLAUDE.md v1.0.0**
