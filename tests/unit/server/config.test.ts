import { describe, it, expect } from 'vitest';
import {
  loadServerConfig,
  requireCapability,
  capabilityStates,
  RATE_LIMIT_DEFAULTS,
} from '@/server/config';
import { AppError } from '@/server/http/errors';

describe('server config — §38 contract', () => {
  it('parses a fully configured environment', () => {
    const config = loadServerConfig({
      SITE_URL: 'https://firm.example',
      ENVIRONMENT: 'production',
      DATABASE_URL: 'postgresql://user:pw@host:6543/db',
      CMS_API_URL: 'https://p.api.sanity.io/v2025-02-19/data/query/prod',
      CMS_API_TOKEN: 'cms-token',
      CRM_API_KEY: 'crm-key',
      EMAIL_API_KEY: 'email-key',
      EMAIL_FROM: 'noreply@firm.example',
      EMAIL_TO_INTERNAL: 'leads@firm.example',
      RATE_LIMIT_WINDOW: '600',
      RATE_LIMIT_MAX: '3',
      OUTBOX_WORKER_SECRET: 'worker-secret',
    });
    expect(config.database?.url).toContain('postgresql://');
    expect(config.crm?.apiBase).toBe('https://api.brevo.com/v3');
    expect(config.email?.toInternal).toBe('leads@firm.example');
    expect(config.cms?.apiToken).toBe('cms-token');
    expect(config.rateLimit).toEqual({ windowSeconds: 600, max: 3 });
    expect(config.outboxWorkerSecret).toBe('worker-secret');
  });

  it('treats empty strings as unset (KEY= lines in .env files)', () => {
    const config = loadServerConfig({
      DATABASE_URL: '',
      CRM_API_KEY: '  ',
      EMAIL_API_KEY: '',
      CMS_API_URL: '',
    });
    expect(config.database).toBeUndefined();
    expect(config.crm).toBeUndefined();
    expect(config.email).toBeUndefined();
    expect(config.cms).toBeUndefined();
  });

  it('applies host-agnostic and anti-abuse defaults', () => {
    const config = loadServerConfig({});
    expect(config.siteUrl).toBe('https://example.com');
    expect(config.environment).toBe('development');
    expect(config.rateLimit).toEqual(RATE_LIMIT_DEFAULTS);
  });

  it('email capability requires both EMAIL_API_KEY and EMAIL_FROM', () => {
    const config = loadServerConfig({ EMAIL_API_KEY: 'k' });
    expect(config.email).toBeUndefined();
  });

  it('rejects malformed values with invalid_configuration', () => {
    expect(() => loadServerConfig({ CMS_API_URL: 'not a url' })).toThrowError(
      AppError,
    );
    expect(() => loadServerConfig({ RATE_LIMIT_WINDOW: 'sixty' })).toThrowError(
      AppError,
    );
  });

  it('requireCapability narrows or fails with a 503 not_configured', () => {
    const config = loadServerConfig({ DATABASE_URL: 'postgresql://x/db' });
    expect(requireCapability(config, 'database').url).toBe('postgresql://x/db');
    try {
      requireCapability(config, 'crm');
      expect.unreachable('should have thrown');
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe('not_configured');
      expect(appError.status).toBe(503);
      expect(appError.message).toContain('crm');
    }
  });

  it('capabilityStates reports states only — never values', () => {
    const states = capabilityStates(
      loadServerConfig({ DATABASE_URL: 'postgresql://secret@host/db' }),
    );
    expect(states).toEqual({
      database: 'configured',
      crm: 'unconfigured',
      email: 'unconfigured',
      cms: 'unconfigured',
      ai: 'unconfigured',
      embeddings: 'unconfigured',
    });
    expect(JSON.stringify(states)).not.toContain('secret');
  });
});

describe('AI + embeddings capabilities (ADR-005/DA-10) + DA-6 budget gate', () => {
  it('parses the AI capability with model + budget defaults', () => {
    const config = loadServerConfig({
      AI_PROVIDER_API_KEY: 'sk-ant-xxx',
      AI_MONTHLY_BUDGET: '50',
    });
    expect(config.ai?.provider).toBe('anthropic');
    expect(config.ai?.modelDefault).toBe('claude-haiku-4.5');
    expect(config.ai?.modelComplex).toBe('claude-opus-4-8');
    expect(config.ai?.monthlyBudgetUsd).toBe(50);
    expect(config.ai?.budgetHardStop).toBe(true);
  });

  it('the hard-stop is engaged by default and only an explicit "false" lifts it', () => {
    expect(
      loadServerConfig({ AI_PROVIDER_API_KEY: 'k' }).ai?.budgetHardStop,
    ).toBe(true);
    expect(
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_BUDGET_HARD_STOP: 'false',
      }).ai?.budgetHardStop,
    ).toBe(false);
  });

  it('DA-6 gate fails CLOSED: configured AI + no budget + hard-stop → refuse', async () => {
    const { aiBudgetGate } = await import('@/server/config');
    const noBudget = loadServerConfig({ AI_PROVIDER_API_KEY: 'k' }).ai;
    expect(noBudget).toBeDefined();
    const gate = aiBudgetGate(noBudget!);
    expect(gate.hardStopEngaged).toBe(true);
    expect(gate.reason).toContain('DA-6');

    const withBudget = loadServerConfig({
      AI_PROVIDER_API_KEY: 'k',
      AI_MONTHLY_BUDGET: '25',
    }).ai;
    expect(aiBudgetGate(withBudget!).hardStopEngaged).toBe(false);
  });

  it('parses the embeddings capability with the Voyage default model', () => {
    const config = loadServerConfig({ EMBEDDINGS_API_KEY: 'voy-xxx' });
    expect(config.embeddings?.provider).toBe('voyage');
    expect(config.embeddings?.model).toBe('voyage-3-lite');
  });

  it('applies the IA rate-limit defaults (10/hour) distinct from forms', () => {
    const config = loadServerConfig({});
    expect(config.aiRateLimit).toEqual({ windowSeconds: 3600, max: 10 });
    expect(config.rateLimit).toEqual({ windowSeconds: 3600, max: 5 });
  });

  it('rejects a non-numeric AI_MONTHLY_BUDGET at config load (fail-closed, never NaN)', () => {
    expect(() =>
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: 'not-a-number',
      }),
    ).toThrowError(AppError);
    expect(() =>
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: '€500',
      }),
    ).toThrowError(AppError);
    expect(() =>
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: '1,000',
      }),
    ).toThrowError(AppError);
  });

  it('rejects a negative AI_MONTHLY_BUDGET at config load', () => {
    expect(() =>
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: '-50',
      }),
    ).toThrowError(AppError);
  });

  it('accepts a valid positive AI_MONTHLY_BUDGET, including decimals', () => {
    expect(
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: '250.50',
      }).ai?.monthlyBudgetUsd,
    ).toBe(250.5);
  });

  it('a malformed budget can never reach aiBudgetGate as NaN (config load throws first)', async () => {
    const { aiBudgetGate } = await import('@/server/config');
    // loadServerConfig throws before an AiConfig with a NaN budget could ever
    // exist — this documents the guarantee the P2 hardening restores.
    expect(() =>
      loadServerConfig({
        AI_PROVIDER_API_KEY: 'k',
        AI_MONTHLY_BUDGET: 'garbage',
      }),
    ).toThrowError(AppError);
    // A validly-parsed config still gates correctly (regression check).
    const ai = loadServerConfig({
      AI_PROVIDER_API_KEY: 'k',
      AI_MONTHLY_BUDGET: '100',
    }).ai;
    expect(aiBudgetGate(ai!).hardStopEngaged).toBe(false);
  });
});
