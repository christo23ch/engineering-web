# Engineering Web — Professional Website Platform

![Status](https://img.shields.io/badge/status-Phase%200-yellow)
![Stack](https://img.shields.io/badge/stack-Astro%20%2B%20React%20%2B%20PostgreSQL-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

A premium, performance-first website platform for a Spanish engineering firm specializing in industrial, energetic, MEP, and renewable energy projects. Built with **Jamstack** architecture (Astro + React islands + headless CMS + PostgreSQL + RAG-powered AI).

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Status](#project-status)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Key Documentation](#key-documentation)
- [Development Workflow](#development-workflow)
- [Architecture Decisions](#architecture-decisions)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Quick Start

> ⚠️ **Estado real (2026-07-08):** el repositorio contiene **solo documentación y estructura de carpetas**. El tooling (`package.json`, `tsconfig.json`, `astro.config.ts`, `tailwind.config.ts`), la configuración de lint/format, los workflows de CI y el `.env.example` **todavía no existen** — se crearán en el **scaffolding técnico de Fase 0**. Los comandos y la estructura de esta sección describen el **objetivo**, no el estado actual; `npm install` / `npm run dev` aún no funcionarán. Fuente de verdad del estado: **Bible §46 (roadmap)** y **CLAUDE.md**.

### Prerequisites
- **Node.js** 18+ (with npm or pnpm)
- **Git**
- Environment variables (see `.env.example`)

### Installation

```bash
# Clone repository
git clone https://github.com/christo23ch/engineering-web.git
cd engineering-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in required values (see Configuration section below)

# Start development server
npm run dev

# Open browser
# http://localhost:4321  (Astro dev server default)
```

### Build & Deploy

```bash
# Build static site (SSG + rebuild-on-webhook)
npm run build

# Preview production build locally
npm run preview

# Deploy (see Phase 1 for hosting options)
# Vercel, Netlify, or Cloudflare Pages
```

---

## 📊 Project Status

**Phase 0: Discovery & Technical Scaffolding** 🔶

- ✅ Complete documentation: PROJECT_BIBLE.md (1,455 lines) + DESIGN_SYSTEM.md (473 lines)
- ✅ Repository structure initialized
- ✅ Session context preserved (CLAUDE.md)
- ⏳ **Pending:** Resolve 11 hypotheses + 9 open decisions (see CLAUDE.md for details)
- ⏳ **Next:** Initialize Astro scaffolding, CI/CD, design tokens

**Phase 1: MVP** (6 weeks, pending Phase 0 completion)
- Component library implementation (~30 components)
- Page development (Home, 6 Service pages, Portfolio, Case detail, About/Team, Contact, Legal)
- BFF serverless functions (forms, CRM webhook, email, persistence)
- PostgreSQL + pgvector integration
- Headless CMS integration

**Phase 2: Content & IA** (2 months)
- IA assistant widget with RAG (Claude Anthropic)
- Content loading: Services, Case studies, Articles, Team
- Vector index training (pgvector)
- Monitoring setup (Core Web Vitals, error tracking)

**Phase 3: Automation & i18n** (2 months)
- i18n infrastructure (ES → EN routing)
- Lead automation + CRM sync
- Performance optimization (Core Web Vitals P75 mobile targets)

**Phase 4: Private Area** (6+ months, post-MVP)
- Authenticated client portal
- Team collaboration tools
- Advanced analytics

---

## 🛠 Tech Stack

### Frontend
- **Astro** (SSG + rebuild-on-webhook; ISR is a provider-dependent optimization — DA-3; zero JS by default)
- **React** (islands architecture, TypeScript strict)
- **Tailwind CSS** (design tokens, responsive, WCAG 2.2 AA)
- **Inter** (variable font, 1 file ~48kB)
- **Lucide** (linear icons, 24×24, currentColor)

### Backend & Data
- **PostgreSQL** (EU-hosted, provider TBD)
- **pgvector** (vector index for RAG)
- **Headless CMS** (Strapi/Sanity/Storyblok, provider TBD)
- **BFF Serverless** (form handling, CRM webhook, email, persistence)

### AI & Content
- **Claude (Anthropic)** (RAG-anchored, no hallucinations, via BFF proxy only)
  - Haiku by default (cost optimization)
  - Sonnet/Opus for complex Q&A
- **Embeddings** (Voyage AI recommended — DA-10; Anthropic has no embeddings API)
- **RAG Pipeline** (chunk → embed → pgvector → retrieve → prompt; prompt-injection guardrails)

### Tooling & Quality
- **ESLint** (strict a11y rules)
- **Prettier** (code formatting)
- **GitHub Actions** (CI/CD: lint → build → axe accessibility → Lighthouse)
- **Axe-core** (WCAG 2.2 AA automated testing, CI blocker)
- **Lighthouse** (Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1)

### Deployment
- **Vercel/Netlify/Cloudflare Pages** (provider TBD)
- **GitHub Actions** (automated deployment on push)

---

## 📁 Repository Structure

> **Nota:** el árbol siguiente es la **estructura objetivo**. Hoy existen las carpetas (con `.gitkeep`) y la documentación; los archivos de código, tooling y CI marcados abajo se irán creando en Fase 0/1. Lo ya presente: `docs/*`, `CLAUDE.md`, `README.md`, `.gitignore`, `.editorconfig`, `.nvmrc` y las carpetas vacías.

```
engineering-web/
├── docs/                              # Documentation (Bible = SSOT)
│   ├── PROJECT_BIBLE.md               # Vision, requirements, architecture, policy (1,455 lines)
│   ├── DESIGN_SYSTEM.md               # Design tokens, components, screens (473 lines)
│   ├── adr/                           # Architecture Decision Records (optional)
│   └── .gitkeep
│
├── src/                               # Astro source code
│   ├── pages/                         # Routes (auto-routed to /pages)
│   │   ├── index.astro                # Home page
│   │   ├── [service]/                 # Dynamic service pages (6 total)
│   │   ├── portfolio/                 # Portfolio index
│   │   ├── [project]/                 # Dynamic case detail
│   │   ├── about.astro                # About/Team/Certs
│   │   ├── contact.astro              # Contact form
│   │   ├── resources.astro            # Blog/resources
│   │   ├── careers.astro              # Job listings
│   │   ├── legal.astro                # Privacy/Terms
│   │   └── 404.astro                  # 404 error page
│   │
│   ├── components/                    # Reusable React/Astro components
│   │   ├── ui/                        # Primitive UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Form/
│   │   │   └── ...
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   └── Breadcrumbs.astro
│   │   ├── content/                   # Content-specific components
│   │   │   ├── ServiceCard.astro
│   │   │   ├── CaseStudy.astro
│   │   │   ├── Testimonial.astro
│   │   │   └── ...
│   │   └── ia/                        # IA assistant components
│   │       ├── AssistantWidget.tsx    # Floating trigger + side panel
│   │       └── SourceCitation.tsx     # Mandatory source display
│   │
│   ├── layouts/                       # Astro layout templates
│   │   ├── BaseLayout.astro
│   │   ├── PageLayout.astro
│   │   └── BlogLayout.astro
│   │
│   ├── lib/                           # Utilities & helpers
│   │   ├── api/                       # BFF client functions
│   │   │   ├── leads.ts               # Lead form submission
│   │   │   ├── crm.ts                 # CRM webhook
│   │   │   └── ai.ts                  # RAG retrieval
│   │   ├── db/                        # Database queries
│   │   │   └── queries.ts
│   │   ├── utils/                     # General utilities
│   │   │   ├── formatting.ts
│   │   │   ├── validation.ts
│   │   │   └── ...
│   │   └── constants.ts
│   │
│   └── styles/                        # Global styles (Tailwind)
│       └── globals.css
│
├── public/                            # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   ├── robots.txt
│   └── sitemap.xml
│
├── assets/                            # Source assets (not served)
│   ├── images/                        # Original images for optimization
│   └── ...
│
├── config/                            # Configuration files
│   ├── constants.config.ts
│   └── ...
│
├── tests/                             # Test suites
│   ├── unit/                          # Unit tests (utilities, helpers)
│   ├── integration/                   # Integration tests (BFF, DB)
│   └── e2e/                           # E2E tests (Playwright)
│
├── scripts/                           # Build & maintenance scripts
│   ├── build-search-index.ts
│   ├── seed-db.ts
│   └── ...
│
├── .github/                           # GitHub configuration
│   ├── workflows/
│   │   ├── lint.yml                   # ESLint + Prettier (blocker)
│   │   ├── build.yml                  # Build + axe accessibility (blocker)
│   │   └── lighthouse.yml             # Lighthouse audit (warn)
│   └── pull_request_template.md
│
├── .vscode/                           # VS Code settings
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── CLAUDE.md                          # Session context & continuation guide
├── .env.example                       # Environment variables template
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── tsconfig.json                      # TypeScript strict mode
├── astro.config.ts                    # Astro configuration
├── tailwind.config.ts                 # Tailwind design tokens
├── package.json
└── README.md                          # You are here
```

---

## 📚 Key Documentation

> **Documentary policy (official):** **`docs/PROJECT_BIBLE.md` is the single source of truth (v1.0 official).** Every other document complements it and must never contradict it; new decisions land in the Bible first (§43/§49) and then propagate here. On any discrepancy, **the Bible wins.**

### Must Read
1. **[docs/PROJECT_BIBLE.md](./docs/PROJECT_BIBLE.md)** — **SSOT (v1.0 official):** vision (§1-§3), requirements (§8), architecture (§11-§14), IA policy (§16), data model (§28), env vars (§38), ADRs (§43), hypotheses (§44), roadmap (§46), decisions §49 (DA-1…DA-9)
2. **[CLAUDE.md](./CLAUDE.md)** — Session context, roadmap, open decisions, how to resume work
3. **[docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)** — Design tokens (§2-§5), components (§11), screens (§13), accessibility (§14)

### Reference
- **docs/adr/** — Individual Architecture Decision Records (ADR-001 through ADR-010, optional)
- **docs/SECURITY.md** — Security policy & threat model (stub — pending content; complements Bible §17)
- **docs/{ARCHITECTURE, DATABASE, API, UI_UX, ROADMAP, IMPLEMENTATION_PLAN, CODING_STANDARDS, TESTING}.md** — topic stubs (pending content; each complements its Bible section)
- **CONTRIBUTING.md** — Contribution guidelines (not yet created)

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and fill in required values:

```bash
# Canonical names — must match Bible §38 (SSOT) verbatim.

# CMS (Headless, provider TBD via DA-7)
CMS_API_URL=
CMS_API_TOKEN=

# Database (PostgreSQL + pgvector, provider TBD via DA-5)
DATABASE_URL=postgresql://user:password@host:5432/engineering_web
DATABASE_VECTOR_POOL_SIZE=20

# CRM (for lead webhook, provider TBD via DA-2)
CRM_API_BASE=
CRM_API_KEY=
CRM_WEBHOOK_SECRET=

# IA / Claude — generation (Anthropic, via BFF proxy only)
AI_PROVIDER=anthropic
AI_PROVIDER_API_KEY=
AI_MODEL_DEFAULT=claude-haiku-4.5
AI_MODEL_COMPLEX=claude-opus-4-8
AI_MONTHLY_BUDGET=
AI_BUDGET_HARD_STOP=true

# Embeddings (RAG vectorization, provider TBD via DA-10 — Voyage AI recommended)
EMBEDDINGS_PROVIDER=voyage
EMBEDDINGS_API_KEY=
EMBEDDINGS_MODEL=voyage-3-lite

# Email (transactional, provider TBD via DA-8)
EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=noreply@engineering-firm.es

# Analytics (provider TBD via DA-9)
ANALYTICS_PROVIDER=plausible
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

### Astro Configuration

See `astro.config.ts`:
- Tailwind CSS integration
- Image optimization
- Sitemap + robots.txt generation
- TypeScript strict mode

### Tailwind Configuration

See `tailwind.config.ts`:
- **3-tier design tokens:** Primitive (colors, spacing) → Semantic (text-primary, color-action) → Component
- **All tokens from DESIGN_SYSTEM.md §2-§5** (colors, spacing, typography, breakpoints)
- **WCAG 2.2 AA contrast verified** in semantic layer
- **Breakpoints:** 320, 640, 768, 1024, 1280 (mobile-first)

---

## 💻 Development Workflow

### Local Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npm run typecheck

# Lint & format check
npm run lint
npm run lint:fix

# Run tests
npm run test              # All tests
npm run test:unit         # Unit only
npm run test:integration  # Integration only
npm run test:e2e          # E2E only

# Accessibility audit
npm run audit:a11y

# Performance audit (Lighthouse)
npm run audit:lighthouse
```

### Git Workflow

1. **Create feature branch** from `main`:
   ```bash
   git checkout -b feature/component-button
   ```

2. **Commit with descriptive messages** (reference Bible sections):
   ```bash
   git commit -m "Add Button component from DESIGN_SYSTEM §11.1
   
   Implements primary, secondary, tertiary variants with states
   (default, hover, focus, active, disabled). Accessibility: WCAG 2.2 AA
   compliant (2px focus ring, keyboard nav, label association)."
   ```

3. **Run pre-commit checks:**
   ```bash
   npm run lint:fix
   npm run typecheck
   npm run test
   ```

4. **Push and create PR:**
   ```bash
   git push -u origin feature/component-button
   ```

5. **PR template** (auto-filled from `.github/pull_request_template.md`):
   - Reference Bible sections impacted
   - List components/pages changed
   - Testing checklist
   - Accessibility checklist
   - Performance impact (if any)

### CI/CD Pipeline

GitHub Actions runs on every push:
1. **Lint** (ESLint + Prettier) — Blocker
2. **Build** (Astro) — Blocker
3. **Accessibility** (axe-core) — Blocker
4. **Performance** (Lighthouse) — Warning only (for now)

All blockers must pass before merge.

---

## 🏗 Architecture Decisions

All architectural decisions documented in **CLAUDE.md** (Decisions Status table) and **docs/PROJECT_BIBLE.md (§43)**:

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | Jamstack (SSG + rebuild-on-webhook; ISR = provider-dependent optimization) | ✅ Locked |
| ADR-002 | Astro + React islands + TypeScript strict (Astro definitive; revisable only pre-F4) | ✅ Locked |
| ADR-003 | Headless CMS (provider TBD) | ⏳ Pending DA-7 |
| ADR-004 | PostgreSQL + pgvector (EU-hosted) | ⏳ Pending DA-5 |
| ADR-005 | RAG + Claude via BFF proxy only (prompt-injection guardrails; embeddings via DA-10) | ✅ Locked |
| ADR-006 | RBAC: public/authenticated/admin | ✅ Locked |
| ADR-007 | CI/CD via GitHub Actions | ✅ Locked |
| ADR-008 | Lead persistence (email + CRM webhook → PostgreSQL) | ⏳ Pending DA-2 |
| ADR-009 | i18n design-first (ES now, EN in F3) | ✅ Locked |
| ADR-010 | Outbox pattern + scheduled retry worker (durable lead delivery) | ✅ Locked |

**Closed Decision:**
- ✅ DA-1: Stack — **Astro definitive** (WordPress discarded)

**Open Decisions Blocking Development:**
- DA-2: CRM provider (HubSpot/Brevo/Pipedrive/custom)
- DA-3: Hosting (Vercel/Netlify/Cloudflare Pages) — **must close before BFF**
- DA-4: Editorial workflow (direct publish vs approval gate)
- DA-5: PostgreSQL provider (Supabase/Neon/AWS RDS) — serverless pooler required
- DA-6: IA scope in F2 (features + max monthly budget + hard-stop cutoff)
- DA-7: CMS provider (Strapi/Sanity/Storyblok/Contentful) — evaluate cost per seat
- DA-8: Email transactional provider (SendGrid/Brevo/Resend/other)
- DA-9: Analytics tool (Plausible/GA4/PostHog)
- DA-10: Embeddings provider — **Voyage AI recommended** (vs OpenAI/Cohere) — must close before RAG

Canonical definitions in **Bible §49 (SSOT)**; see **CLAUDE.md** for tracking context and validation criteria.

---

## 🎨 Design System

All design decisions implement **docs/DESIGN_SYSTEM.md** (§1-§14), which traces back to **PROJECT_BIBLE** requirements.

### Core Principles
1. **Clarity > Creativity** — Technical audience, premium sobriety
2. **Data as aesthetic** — Metrics, certifications, case studies = design
3. **Single CTA per page** — Lead generation focus
4. **Performance-first** — Core Web Vitals non-negotiable
5. **WCAG 2.2 AA by default** — Accessibility is accessibility
6. **Mobile-first** — 320px base, responsive grid
7. **Tokens-driven** — No magic colors/spacing, design system contract

### Design Tokens (Tailwind)

**Primitives (§2)**
- Colors: Blue (technical/action), Green (sustainability), Gray (text), Red/Amber (states)
- Spacing: 4px base scale (1/2/3/4/6/8/12/16/24/32)
- Typography: Inter variable + fluid scaling (clamp)
- Breakpoints: 320, 640, 768, 1024, 1280

**Semantic Tokens (§3)**
- `text-primary` (17.7:1 contrast, body text)
- `text-secondary` (7.6:1 contrast, secondary text)
- `text-muted` (4.8:1 contrast, hints)
- `color-action` (6.3:1 contrast, CTAs)
- `surface-*`, `border-*`, `focus-ring`

**Component Tokens (§4+)**
- Applied via Tailwind classes: `btn-primary`, `card-service`, `form-input`, etc.
- All states predefined: default, hover, focus, active, disabled, loading, error, success

---

## ♿ Accessibility (WCAG 2.2 AA)

**Standards:**
- All contrast ratios verified in token layer
- Keyboard navigation on all interactive elements
- Visible labels on all form inputs
- Meaningful alt text on all images
- `prefers-reduced-motion` honored
- Touch targets ≥ 44×44px (mobile)
- Focus ring: 2px blue-700 + 2px offset (mandatory)

**Testing:**
- **Automated:** axe-core in CI (blocker)
- **Manual:** Before each launch (§13 DESIGN_SYSTEM)

**Resources:**
- WCAG 2.2 Level AA Checklist: https://www.w3.org/WAI/WCAG22/checklist/
- WebAIM: https://webaim.org/
- Component Library accessible components template (TBD in Phase 1)

---

## 🚀 Deployment

### Prerequisites (Varies by Provider)
- GitHub access (via GitHub App)
- Environment variables in hosting platform
- PostgreSQL database set up (EU-hosted, per GDPR)
- CMS instance running
- Email provider configured
- CRM webhook ready

### Deployment Flow

1. **Push to main branch** → GitHub Actions runs CI pipeline
2. **All checks pass** → Automatic deployment to production (or manual, per DA-3 choice)
3. **Monitor:** Core Web Vitals (Lighthouse), error tracking, logs

### Hosting Options (TBD via DA-3)
- **Vercel:** Native Astro support, edge functions, automatic deployments
- **Netlify:** Astro support, functions, form handling
- **Cloudflare Pages:** SSG hosting, Workers for BFF

---

## 🧪 Testing

**Unit Tests** (utilities, helpers)
```bash
npm run test:unit
```

**Integration Tests** (BFF, CRM webhook, DB queries)
```bash
npm run test:integration
```

**E2E Tests** (user flows, Playwright)
```bash
npm run test:e2e
```

**Accessibility Tests** (axe-core, automated)
```bash
npm run audit:a11y
```

**Performance Tests** (Lighthouse, Core Web Vitals)
```bash
npm run audit:lighthouse
```

---

## 🔐 Security

**Policy:** RAG-anchored IA only (no hallucinations), BFF proxy intercepts all AI calls, strict input validation at system boundaries.

**Secrets Management:**
- No API keys in source code
- All secrets in `.env` (git-ignored)
- GitHub Secrets for CI/CD
- Environment-specific configs

**OWASP Top 10:**
- Input validation on all forms (BFF)
- No SQL injection (parameterized queries via ORM)
- No XSS (Astro SSR by default, React sanitization)
- No CSRF (SameSite cookies, CSRF tokens on forms)
- No sensitive data exposure (HTTPS only, secure headers)

Canonical security policy: **Bible §17** (SSOT). See **docs/SECURITY.md** (stub, pending content) for the expanded operational detail.

---

## 📞 Support & Contributing

### Questions?
1. Check **CLAUDE.md** for session context
2. Read **PROJECT_BIBLE.md** for architectural decisions
3. Review **DESIGN_SYSTEM.md** for component specs
4. Open an issue on GitHub (if applicable)

### Contributing
See **CONTRIBUTING.md** (TBD) for:
- Code style (TypeScript strict, ESLint, Prettier)
- Commit message format
- PR review process
- Testing requirements
- Performance budget enforcement

### Hypotheses & Decisions
11 hypotheses + 9 open decisions documented in **CLAUDE.md**. Cannot proceed past Phase 0 without validation/closure.

---

## 📄 License

Proprietary. All rights reserved. Contact repo owner for licensing inquiries.

---

## 👥 Contributors

- **Architect:** Claude (Anthropic)
- **Product Owner:** [TBD — Client]
- **CTO:** [TBD — Client/Team]
- **Design:** [TBD — Client/Team]

---

**Last Updated:** 2026-07-08  
**Phase:** 0 (Discovery & Scaffolding)  
**Status:** 🟡 Awaiting decisions/hypotheses validation  

For full project context, see **[CLAUDE.md](./CLAUDE.md)** and **[docs/PROJECT_BIBLE.md](./docs/PROJECT_BIBLE.md)**.
