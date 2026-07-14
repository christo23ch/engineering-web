/**
 * Endpoint dependency wiring. Route files stay one-liners: they bind a
 * factory that lazily resolves config/db/log from the environment. Module
 * scope persists per serverless instance, so config parsing and the DB pool
 * are created once and reused across invocations (Supabase pooler friendly).
 *
 * Everything is lazy: importing a route never connects anywhere, and a
 * missing capability surfaces as the client-safe 503 when (and only when) a
 * request actually needs it.
 */
import { loadServerConfig, requireCapability } from '@/server/config';
import type { ServerConfig } from '@/server/config';
import { createPostgresClient, type DbClient } from '@/server/db/client';
import { getLogger, type Logger } from '@/server/logging/logger';

export interface EndpointDeps {
  config: ServerConfig;
  /** Lazy: throws the 503 not_configured only when a handler needs the DB. */
  db: () => DbClient;
  log: Logger;
  /** Injectable for tests; outbox handlers call vendors through this. */
  fetchImpl?: typeof fetch;
}

export type EndpointDepsFactory = () => EndpointDeps;

let cachedConfig: ServerConfig | undefined;
let cachedDb: DbClient | undefined;
let cachedDbUrl: string | undefined;

export function getServerConfig(): ServerConfig {
  cachedConfig ??= loadServerConfig();
  return cachedConfig;
}

function getDb(config: ServerConfig): DbClient {
  const { url } = requireCapability(config, 'database');
  if (!cachedDb || cachedDbUrl !== url) {
    cachedDb = createPostgresClient(url);
    cachedDbUrl = url;
  }
  return cachedDb;
}

export function defaultEndpointDeps(): EndpointDeps {
  const config = getServerConfig();
  return {
    config,
    db: () => getDb(config),
    log: getLogger(),
  };
}
