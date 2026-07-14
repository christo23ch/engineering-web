import { describe, it, expect } from 'vitest';
import {
  signSanityWebhook,
  verifySanityWebhookSignature,
} from '@/server/integrations/sanity/webhook';
import { createSanityClient } from '@/server/integrations/sanity/client';

const SECRET = 'shhh-webhook-secret';
const BODY = JSON.stringify({ _type: 'article', slug: { current: 'a-1' } });
const T0 = new Date('2026-07-14T10:00:00Z');
const at = (offsetMs: number) => () => new Date(T0.getTime() + offsetMs);

describe('sanity webhook signature (ADR-001)', () => {
  it('accepts a correctly signed payload within tolerance', () => {
    const header = signSanityWebhook(SECRET, BODY, T0.getTime() - 60_000);
    const check = verifySanityWebhookSignature({
      header,
      body: BODY,
      secret: SECRET,
      now: at(0),
    });
    expect(check).toEqual({ valid: true });
  });

  it('rejects a tampered body', () => {
    const header = signSanityWebhook(SECRET, BODY, T0.getTime());
    const check = verifySanityWebhookSignature({
      header,
      body: BODY.replace('a-1', 'a-2'),
      secret: SECRET,
      now: at(0),
    });
    expect(check.valid).toBe(false);
    expect(check.reason).toBe('signature mismatch');
  });

  it('rejects a wrong secret', () => {
    const header = signSanityWebhook('otro-secreto', BODY, T0.getTime());
    expect(
      verifySanityWebhookSignature({
        header,
        body: BODY,
        secret: SECRET,
        now: at(0),
      }).valid,
    ).toBe(false);
  });

  it('rejects missing and malformed headers', () => {
    expect(
      verifySanityWebhookSignature({
        header: null,
        body: BODY,
        secret: SECRET,
      }).reason,
    ).toBe('missing signature header');
    expect(
      verifySanityWebhookSignature({
        header: 'v1=abc',
        body: BODY,
        secret: SECRET,
      }).reason,
    ).toBe('malformed signature header');
  });

  it('rejects replays outside the ±5 min window', () => {
    const stale = signSanityWebhook(SECRET, BODY, T0.getTime() - 6 * 60_000);
    expect(
      verifySanityWebhookSignature({
        header: stale,
        body: BODY,
        secret: SECRET,
        now: at(0),
      }).reason,
    ).toBe('timestamp outside tolerance');
    // …but small clock skew in either direction is fine.
    const skewed = signSanityWebhook(SECRET, BODY, T0.getTime() + 2 * 60_000);
    expect(
      verifySanityWebhookSignature({
        header: skewed,
        body: BODY,
        secret: SECRET,
        now: at(0),
      }).valid,
    ).toBe(true);
  });
});

describe('sanity client — drafts perspective (preview, F2)', () => {
  it('appends the perspective param only when requested', async () => {
    const urls: URL[] = [];
    const impl: typeof fetch = (input) => {
      urls.push(new URL(String(input)));
      return Promise.resolve(
        new Response(JSON.stringify({ result: [] }), { status: 200 }),
      );
    };
    const config = {
      apiUrl: 'https://p.api.sanity.io/v2025-02-19/data/query/production',
      apiToken: 't',
    };
    await createSanityClient(config, impl).fetch('*');
    await createSanityClient(config, impl, { perspective: 'drafts' }).fetch(
      '*',
    );
    expect(urls[0]?.searchParams.get('perspective')).toBeNull();
    expect(urls[1]?.searchParams.get('perspective')).toBe('drafts');
  });
});
