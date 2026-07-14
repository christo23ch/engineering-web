-- 0002_embeddings — RAG vector store (Bible §28 entity "Documento de
-- embedding", ADR-004 PostgreSQL + pgvector, ADR-005 RAG). F2 scope, gated on
-- DA-6 (client-ratified IA budget) at runtime — the schema is inert until the
-- indexing pipeline runs, and the assistant fails closed without a budget.
--
-- Dimension 512 = voyage-3-lite (DA-10). If EMBEDDINGS_MODEL changes to a
-- different dimensionality, this column and the code guard must change
-- together (a new migration) — see src/server/rag/embeddings/voyage.ts.

create extension if not exists vector;

create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  -- Provenance back to the source document (§28) for citations.
  source_type text not null
    check (source_type in ('service', 'caseStudy', 'article')),
  source_slug text not null,
  source_title text not null,
  chunk_index integer not null,
  content text not null,
  token_count integer not null,
  embedding vector(512) not null,
  -- Idempotency: re-indexing skips chunks whose content hash is unchanged.
  content_hash text not null,
  -- The embedding model + a content-set version, so a model swap or content
  -- rebuild invalidates stale rows deterministically.
  embedding_model text not null,
  index_version text not null,
  created_at timestamptz not null default now(),
  unique (source_type, source_slug, chunk_index, index_version)
);

-- Approximate nearest-neighbour index for cosine distance (`<=>`). ivfflat
-- needs ANALYZE + a populated table to be effective; the indexing pipeline
-- runs `analyze embeddings` after a load. Lists sized for the small MVP
-- corpus (hundreds–thousands of chunks).
create index if not exists embeddings_vector_idx
  on embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists embeddings_source_idx
  on embeddings (source_type, source_slug);

-- Durable monthly AI cost ledger (DA-6 hard-stop). One row per calendar
-- month accumulates token spend; the budget guard reads it before each call.
create table if not exists ai_usage (
  period text primary key, -- 'YYYY-MM' (UTC)
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  embedding_tokens bigint not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  requests integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Durable answer cache (avoid re-spending on identical questions). Keyed by
-- the normalized-question hash + the index version, so a content rebuild
-- invalidates cached answers.
create table if not exists ai_answer_cache (
  cache_key text primary key,
  question text not null,
  answer jsonb not null,
  index_version text not null,
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists ai_answer_cache_expiry_idx
  on ai_answer_cache (expires_at);

-- Observability: one row per assistant request (operational telemetry, §34;
-- NOT a §28 domain entity). No PII — the question text is retained for
-- quality review per the IA policy (§16); redact/rotate per retention policy.
create table if not exists ai_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  outcome text not null
    check (outcome in ('answered', 'refused', 'fallback', 'error')),
  model text,
  retrieved_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  cache_hit boolean not null default false,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_events_created_at_idx
  on ai_events (created_at);
