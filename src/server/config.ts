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
  AI_PROVIDER: optionalString,
  AI_PROVIDER_API_KEY: optionalString,
  AI_MODEL_DEFAULT: optionalString,
  AI_MODEL_COMPLEX: optionalString,
  AI_MONTHLY_BUDGET: optionalString,
  AI_BUDGET_HARD_STOP: optionalString,
  AI_RATE_LIMIT_WINDOW: optionalPositiveInt,
  AI_RATE_LIMIT_MAX: optionalPositiveInt,
  EMBEDDINGS_PROVIDER: optionalString,
  EMBEDDINGS_API_KEY: optionalString,
  EMBEDDINGS_MODEL: optionalString,
});

export type Capability =
  'database' | 'crm' | 'email' | 'cms' | 'ai' | 'embeddings';

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

export interface AiConfig {
  /** Anthropic (ADR-005). Generation only, via the BFF proxy. */
  apiKey: string;
  provider: string;
  modelDefault: string;
  modelComplex: string;
  /**
   * DA-6 budget guardrail (REQUIRES CLIENT RATIFICATION). Monthly cap in USD,
   * or undefined when the client has not set it yet.
   */
  monthlyBudgetUsd?: number;
  /**
   * Hard-stop switch (default ON). Fail-closed: with the hard-stop on and no
   * budget set, the assistant refuses rather than spending — the client
   * ratifies the number before any cost can occur.
   */
  budgetHardStop: boolean;
}

export interface EmbeddingsConfig {
  /** Voyage AI (DA-10). Anthropic has no embeddings API. */
  apiKey: string;
  provider: string;
  model: string;
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
  ai?: AiConfig;
  embeddings?: EmbeddingsConfig;
  rateLimit: RateLimitConfig;
  /** IA-specific anti-abuse window (Bible §16/§17). */
  aiRateLimit: RateLimitConfig;
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

/** IA anti-abuse defaults (Bible §16): 10 questions per client per hour. */
export const AI_RATE_LIMIT_DEFAULTS: RateLimitConfig = {
  windowSeconds: 3600,
  max: 10,
};

const DEFAULT_CRM_API_BASE = 'https://api.brevo.com/v3';
const DEFAULT_AI_MODEL_DEFAULT = 'claude-haiku-4.5';
const DEFAULT_AI_MODEL_COMPLEX = 'claude-opus-4-8';
const DEFAULT_EMBEDDINGS_MODEL = 'voyage-3-lite';

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
    ai: raw.AI_PROVIDER_API_KEY
      ? {
          apiKey: raw.AI_PROVIDER_API_KEY,
          provider: raw.AI_PROVIDER ?? 'anthropic',
          modelDefault: raw.AI_MODEL_DEFAULT ?? DEFAULT_AI_MODEL_DEFAULT,
          modelComplex: raw.AI_MODEL_COMPLEX ?? DEFAULT_AI_MODEL_COMPLEX,
          monthlyBudgetUsd: raw.AI_MONTHLY_BUDGET
            ? Number(raw.AI_MONTHLY_BUDGET)
            : undefined,
          // Default ON: absence of an explicit "false" means the hard-stop
          // stays engaged (fail-closed on cost — DA-6).
          budgetHardStop: raw.AI_BUDGET_HARD_STOP !== 'false',
        }
      : undefined,
    embeddings: raw.EMBEDDINGS_API_KEY
      ? {
          apiKey: raw.EMBEDDINGS_API_KEY,
          provider: raw.EMBEDDINGS_PROVIDER ?? 'voyage',
          model: raw.EMBEDDINGS_MODEL ?? DEFAULT_EMBEDDINGS_MODEL,
        }
      : undefined,
    rateLimit: {
      windowSeconds: raw.RATE_LIMIT_WINDOW
        ? Number(raw.RATE_LIMIT_WINDOW)
        : RATE_LIMIT_DEFAULTS.windowSeconds,
      max: raw.RATE_LIMIT_MAX
        ? Number(raw.RATE_LIMIT_MAX)
        : RATE_LIMIT_DEFAULTS.max,
    },
    aiRateLimit: {
      windowSeconds: raw.AI_RATE_LIMIT_WINDOW
        ? Number(raw.AI_RATE_LIMIT_WINDOW)
        : AI_RATE_LIMIT_DEFAULTS.windowSeconds,
      max: raw.AI_RATE_LIMIT_MAX
        ? Number(raw.AI_RATE_LIMIT_MAX)
        : AI_RATE_LIMIT_DEFAULTS.max,
    },
    outboxWorkerSecret: raw.OUTBOX_WORKER_SECRET,
    cmsWebhookSecret: raw.CMS_WEBHOOK_SECRET,
    deployHookUrl: raw.DEPLOY_HOOK_URL,
  };
}

/**
 * The AI budget number itself is a client-ratified value (DA-6). If the
 * assistant is configured but no budget is set, `hardStopEngaged` reports
 * that requests must be refused (fail-closed) — spend cannot begin until the
 * client ratifies the number.
 */
export function aiBudgetGate(ai: AiConfig): {
  hardStopEngaged: boolean;
  reason?: string;
} {
  if (ai.monthlyBudgetUsd === undefined) {
    return ai.budgetHardStop
      ? { hardStopEngaged: true, reason: 'no ratified budget (DA-6)' }
      : { hardStopEngaged: false };
  }
  return { hardStopEngaged: false };
}

type CapabilityConfigMap = {
  database: DatabaseConfig;
  crm: CrmConfig;
  email: EmailConfig;
  cms: CmsConfig;
  ai: AiConfig;
  embeddings: EmbeddingsConfig;
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
    ai: config.ai ? 'configured' : 'unconfigured',
    embeddings: config.embeddings ? 'configured' : 'unconfigured',
  };
}
