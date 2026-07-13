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
    });
    expect(JSON.stringify(states)).not.toContain('secret');
  });
});
