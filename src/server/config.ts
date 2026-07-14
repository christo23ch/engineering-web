/**
 * BFF configuration contract — canonical names from Bible §38 (SSOT) verbatim.
 * Bible §37: configuration is validated at startup; §13/§17: secrets live only
 * server-side (never shipped to the client bundle).
 *
 * Design: capability-based. Each integration (database, crm, email, cms) is a
 * capability that is either fully configured or absent; endpoints declare what
 * they need via `requireCapability` and fail with an explicit 503
 * `not_configured` instead of crashing mid-request. This keeps every
 * environment honest: local/CI runs without secrets degrade predictably.
 */
import process from 'node:process';
import { z } from 'zod';
import { AppError } from '@/server/http/errors';

/** Treat empty strings as "unset" — `KEY=` lines in .env files are common. */
const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

const optionalUrl = optionalString.refine(
  (value) => value === undefined || URL.canParse(value),
  { message: 'must be a valid URL' },
);

const optionalPositiveInt = optionalString.refine(
  (value) => value === undefined || /^\d+$/.test(value),
  { message: 'must be a positive integer' },
);

/** Raw environment schema — names must match Bible §38 verbatim. */
const envSchema = z.object({
  SITE_URL: optionalUrl,
  ENVIRONMENT: optionalString,
  DATABASE_URL: optionalString,
  CMS_API_URL: optionalUrl,
  CMS_API_TOKEN: optionalString,
  CRM_API_BASE: optionalUrl,
  CRM_API_KEY: optionalString,
  CRM_WEBHOOK_SECRET: optionalString,
  EMAIL_PROVIDER: optionalString,
  EMAIL_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  EMAIL_TO_INTERNAL: optionalString,
  RATE_LIMIT_WINDOW: optionalPositiveInt,
  RATE_LIMIT_MAX: optionalPositiveInt,
  OUTBOX_WORKER_SECRET: optionalString,
  CMS_WEBHOOK_SECRET: optionalString,
  DEPLOY_HOOK_URL: optionalUrl,
});

export type Capability = 'database' | 'crm' | 'email' | 'cms';

export interface DatabaseConfig {
  url: string;
}

export interface CrmConfig {
  /** Brevo (DA-2). Base defaults to the public v3 API. */
  apiBase: string;
  apiKey: string;
}

export interface EmailConfig {
  /** Brevo transactional (DA-8). */
  apiKey: string;
  from: string;
  /** Internal notification inbox (ADR-008). */
  toInternal?: string;
}

export interface CmsConfig {
  /** Sanity GROQ query endpoint (DA-7), full URL per .env.example. */
  apiUrl: string;
  apiToken?: string;
}

export interface RateLimitConfig {
  windowSeconds: number;
  max: number;
}

export interface ServerConfig {
  siteUrl: string;
  environment: string;
  database?: DatabaseConfig;
  crm?: CrmConfig;
  email?: EmailConfig;
  cms?: CmsConfig;
  rateLimit: RateLimitConfig;
  outboxWorkerSecret?: string;
  /** HMAC secret for Sanity publish webhooks (ADR-001 rebuild flow). */
  cmsWebhookSecret?: string;
  /** DA-3 hosting deploy hook POSTed on verified publish webhooks. */
  deployHookUrl?: string;
}

/** Anti-abuse defaults (Bible §17): 5 submissions per client per hour. */
export const RATE_LIMIT_DEFAULTS: RateLimitConfig = {
  windowSeconds: 3600,
  max: 5,
};

const DEFAULT_CRM_API_BASE = 'https://api.brevo.com/v3';

/**
 * Parse the §38 contract from an environment map. Pure — inject a custom map
 * in tests; production callers use the `process.env` default.
 */
export function loadServerConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    throw new AppError('invalid_configuration', 500, 'Invalid configuration', {
      details,
    });
  }
  const raw = parsed.data;

  return {
    siteUrl: raw.SITE_URL ?? 'https://example.com',
    environment: raw.ENVIRONMENT ?? 'development',
    database: raw.DATABASE_URL ? { url: raw.DATABASE_URL } : undefined,
    crm: raw.CRM_API_KEY
      ? {
          apiBase: raw.CRM_API_BASE ?? DEFAULT_CRM_API_BASE,
          apiKey: raw.CRM_API_KEY,
        }
      : undefined,
    email:
      raw.EMAIL_API_KEY && raw.EMAIL_FROM
        ? {
            apiKey: raw.EMAIL_API_KEY,
            from: raw.EMAIL_FROM,
            toInternal: raw.EMAIL_TO_INTERNAL,
          }
        : undefined,
    cms: raw.CMS_API_URL
      ? { apiUrl: raw.CMS_API_URL, apiToken: raw.CMS_API_TOKEN }
      : undefined,
    rateLimit: {
      windowSeconds: raw.RATE_LIMIT_WINDOW
        ? Number(raw.RATE_LIMIT_WINDOW)
        : RATE_LIMIT_DEFAULTS.windowSeconds,
      max: raw.RATE_LIMIT_MAX
        ? Number(raw.RATE_LIMIT_MAX)
        : RATE_LIMIT_DEFAULTS.max,
    },
    outboxWorkerSecret: raw.OUTBOX_WORKER_SECRET,
    cmsWebhookSecret: raw.CMS_WEBHOOK_SECRET,
    deployHookUrl: raw.DEPLOY_HOOK_URL,
  };
}

type CapabilityConfigMap = {
  database: DatabaseConfig;
  crm: CrmConfig;
  email: EmailConfig;
  cms: CmsConfig;
};

/**
 * Narrow a capability to its configured shape or fail with an explicit,
 * client-safe 503 (`not_configured`) — never a crash with a secret in the
 * stack trace.
 */
export function requireCapability<C extends Capability>(
  config: ServerConfig,
  capability: C,
): CapabilityConfigMap[C] {
  const value = config[capability];
  if (!value) throw AppError.notConfigured(capability);
  return value as CapabilityConfigMap[C];
}

/** Capability snapshot for the health endpoint — states only, never values. */
export function capabilityStates(
  config: ServerConfig,
): Record<Capability, 'configured' | 'unconfigured'> {
  return {
    database: config.database ? 'configured' : 'unconfigured',
    crm: config.crm ? 'configured' : 'unconfigured',
    email: config.email ? 'configured' : 'unconfigured',
    cms: config.cms ? 'configured' : 'unconfigured',
  };
}
