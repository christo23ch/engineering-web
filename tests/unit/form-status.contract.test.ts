import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FormStatus from '@/components/content/FormStatus.astro';
import Contact from '@/pages/contacto.astro';
import Jobs from '@/pages/empleo.astro';
import LeadMagnet from '@/components/content/LeadMagnet.astro';
import {
  FORM_STATUS_BANNERS,
  FORM_STATUS_FRAGMENTS,
  SUCCESS_PATH,
} from '@/lib/forms/status';
import { fragmentForError } from '@/server/http/form-flow';
import type { ErrorCode } from '@/server/http/errors';

// CONTRACT: the zero-JS flow only works while the fragment the BFF redirects
// to actually exists as an id in the rendered page. Both sides now read the
// same module, and this test proves the agreement end to end — a rename that
// touched only one side would fail here even if every other suite stayed
// green.

/** Every code in the closed taxonomy (server/http/errors.ts). */
const ALL_ERROR_CODES: ErrorCode[] = [
  'validation_failed',
  'invalid_json',
  'unauthorized',
  'not_found',
  'method_not_allowed',
  'payload_too_large',
  'unsupported_media_type',
  'rate_limited',
  'not_configured',
  'upstream_error',
  'invalid_configuration',
  'internal_error',
];

async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown> = {},
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component, { props });
}

describe('form status contract — server fragments exist in the rendered HTML', () => {
  it('every error code maps to a fragment that FormStatus renders', async () => {
    const html = await render(FormStatus);
    for (const code of ALL_ERROR_CODES) {
      const fragment = fragmentForError(code);
      expect(
        html,
        `no banner renders id="${fragment}" for error code "${code}"`,
      ).toContain(`id="${fragment}"`);
    }
  });

  it('the declared vocabulary and the rendered banners are the same set', async () => {
    const html = await render(FormStatus);
    const rendered = [...html.matchAll(/id="(error-[a-z-]+)"/g)].map(
      (match) => match[1],
    );
    expect(new Set(rendered)).toEqual(
      new Set(Object.values(FORM_STATUS_FRAGMENTS)),
    );
    expect(rendered).toHaveLength(FORM_STATUS_BANNERS.length);
  });

  it('holds on every page that hosts a capture form', async () => {
    const pages = await Promise.all([
      render(Contact),
      render(Jobs),
      render(LeadMagnet),
    ]);
    for (const html of pages) {
      for (const fragment of Object.values(FORM_STATUS_FRAGMENTS)) {
        expect(html).toContain(`id="${fragment}"`);
      }
      // One banner set per page — duplicated ids would break :target and axe.
      expect([...html.matchAll(/id="error-validacion"/g)]).toHaveLength(1);
    }
  });

  it('no fragment literal is duplicated outside the shared module', async () => {
    const { readFileSync } = await import('node:fs');
    const offenders = [
      'src/server/http/form-flow.ts',
      'src/components/content/FormStatus.astro',
      'src/server/endpoints/capture.ts',
    ].filter((file) =>
      /['"`]error-(validacion|limite|no-disponible|inesperado)['"`]/.test(
        readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('success is a screen, not a fragment (POST/redirect/GET, §13.8)', () => {
    expect(SUCCESS_PATH).toBe('/contacto/gracias');
    expect(SUCCESS_PATH).not.toContain('#');
  });
});

describe('honest copy (Bible §17 anti-abuse windows)', () => {
  it('the throttling banner never promises a wait shorter than the window', async () => {
    const { RATE_LIMIT_DEFAULTS } = await import('@/server/config');
    // The page is static and cannot know RATE_LIMIT_WINDOW (an hour by
    // default), so the copy must commit to no duration at all.
    expect(RATE_LIMIT_DEFAULTS.windowSeconds).toBeGreaterThan(600);
    const banner = FORM_STATUS_BANNERS.find(
      (item) => item.fragment === FORM_STATUS_FRAGMENTS.limite,
    );
    expect(banner).toBeDefined();
    const copy = `${banner!.title} ${banner!.body}`.toLowerCase();
    expect(copy).not.toMatch(/minutos?|segundos?|horas?/);
    expect(copy).toContain('más tarde');
  });

  it('no banner claims the submission was stored', async () => {
    const html = await render(FormStatus);
    expect(html).not.toMatch(/hemos recibido tu solicitud|registrada|guardad/i);
  });
});

describe('degradation without the site stylesheet', () => {
  it('every banner is hidden by the user agent, not only by our CSS', async () => {
    const html = await render(FormStatus);
    const banners = [
      ...html.matchAll(/<div[^>]*id="error-[a-z-]+"[^>]*>/g),
    ].map((match) => match[0]);
    expect(banners).toHaveLength(FORM_STATUS_BANNERS.length);
    // Without an attribute-level floor a stylesheet failure would show all
    // four at once. It must be `until-found` rather than plain `hidden`:
    // Tailwind's preflight enforces plain `hidden` as `display:none
    // !important` from inside a cascade layer, which no unlayered rule can
    // override — the banner could then never be revealed at all.
    for (const banner of banners) {
      expect(banner).toContain('hidden="until-found"');
      expect(banner).toContain('tabindex="-1"');
    }
  });

  it('the honeypot is hidden by the attribute, so it can never be shown', async () => {
    const html = await render(LeadMagnet);
    const wrapper = /<div hidden>\s*<input[^>]*name="website"[^>]*>/;
    expect(html).toMatch(wrapper);
    // It must not depend on a class whose stylesheet could fail to load.
    expect(html).not.toContain('class="honeypot"');
  });
});
