-- 0001_init — persistence for the F1 BFF (Bible §28 canonical entities that
-- live in PostgreSQL: Lead, Candidatura, Consentimiento) plus the two
-- operational tables the architecture mandates: the transactional outbox
-- (ADR-010) and the durable rate-limit window (Bible §17 anti-abuse).
--
-- The Embedding entity (§28) is F2 scope: it requires the pgvector extension
-- and the RAG pipeline (DA-6/DA-10 — pending client ratification), so it is
-- deliberately NOT created here.

-- Lead (ADR-008): captured commercial contact. `kind` separates the contact
-- form (RF-06/07) from lead-magnet downloads (RF-13).
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'lead_magnet')),
  name text,
  email text not null,
  company text,
  service_slug text,
  resource_slug text,
  message text,
  source_url text,
  locale text not null default 'es',
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on leads (email);
create index if not exists leads_created_at_idx on leads (created_at);

-- Candidatura (RF-14): job application. Kept apart from leads on purpose —
-- recruitment data has a different GDPR purpose and never syncs to the CRM.
create table if not exists candidatures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text,
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists candidatures_created_at_idx
  on candidatures (created_at);

-- Consentimiento (Bible §21 GDPR): explicit consent record tied to exactly
-- one subject row (lead XOR candidature). IP is stored pseudonymized only.
create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  candidature_id uuid references candidatures (id) on delete cascade,
  subject_email text not null,
  purpose text not null
    check (purpose in ('contact', 'lead_magnet', 'recruitment')),
  granted boolean not null,
  policy_version text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint consents_subject_xor
    check (num_nonnulls(lead_id, candidature_id) = 1)
);

create index if not exists consents_subject_email_idx
  on consents (subject_email);

-- Transactional outbox (ADR-010): delivery jobs written in the SAME
-- transaction as the lead/candidature row. State machine:
--   pending → processing → delivered | pending (retry, future
--   next_attempt_at) | dead (permanent error or attempts exhausted).
create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'dead')),
  attempts integer not null default 0,
  max_attempts integer not null default 8,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists outbox_events_due_idx
  on outbox_events (status, next_attempt_at);

-- Durable fixed-window rate limiting (Bible §17): in-memory counters do not
-- survive serverless invocations (same argument as ADR-010), so the window
-- lives here and is bumped with a single atomic upsert.
create table if not exists rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (bucket, window_start)
);
