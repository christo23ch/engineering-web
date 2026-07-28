import { describe, it, expect } from 'vitest';
import { SUCCESS_PATH } from '@/lib/forms/status';
import {
  errorRedirectPath,
  fragmentForError,
  resolveReturnPath,
} from '@/server/http/form-flow';
import { seeOther, wantsHtml } from '@/server/http/respond';

function request(
  headers: Record<string, string>,
  url = 'https://site.example/api/leads',
) {
  return new Request(url, { method: 'POST', headers });
}

describe('wantsHtml — browser navigation vs fetch client', () => {
  it('detects a native form navigation', () => {
    expect(
      wantsHtml(
        request({
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }),
      ),
    ).toBe(true);
  });

  it('leaves JSON/fetch clients on the JSON contract', () => {
    expect(wantsHtml(request({ accept: 'application/json' }))).toBe(false);
    expect(wantsHtml(request({ accept: '*/*' }))).toBe(false);
    expect(wantsHtml(request({}))).toBe(false);
  });
});

describe('fragmentForError — honest 400/429/503 outcomes', () => {
  it('maps the 400 family to the "check your data" banner', () => {
    expect(fragmentForError('validation_failed')).toBe('error-validacion');
    expect(fragmentForError('invalid_json')).toBe('error-validacion');
    expect(fragmentForError('payload_too_large')).toBe('error-validacion');
    expect(fragmentForError('unsupported_media_type')).toBe('error-validacion');
  });

  it('maps 429 and 503 to their own banners', () => {
    expect(fragmentForError('rate_limited')).toBe('error-limite');
    expect(fragmentForError('not_configured')).toBe('error-no-disponible');
  });

  it('maps anything else to the unexpected-error banner', () => {
    expect(fragmentForError('internal_error')).toBe('error-inesperado');
    expect(fragmentForError('upstream_error')).toBe('error-inesperado');
  });
});

describe('resolveReturnPath — open-redirect policy (§17)', () => {
  it('returns to the same-origin page the form lives on', () => {
    expect(
      resolveReturnPath(
        request({ referer: 'https://site.example/recursos/guia' }),
        '/contacto',
      ),
    ).toBe('/recursos/guia');
  });

  it('keeps only the pathname — no query or fragment rides along', () => {
    expect(
      resolveReturnPath(
        request({ referer: 'https://site.example/contacto?next=/admin#x' }),
        '/contacto',
      ),
    ).toBe('/contacto');
  });

  it('refuses a cross-origin referer', () => {
    expect(
      resolveReturnPath(
        request({ referer: 'https://evil.example/phish' }),
        '/contacto',
      ),
    ).toBe('/contacto');
  });

  it('refuses a protocol-relative or malformed referer', () => {
    expect(
      resolveReturnPath(
        request({ referer: '//evil.example/phish' }),
        '/contacto',
      ),
    ).toBe('/contacto');
    expect(
      resolveReturnPath(request({ referer: 'not a url' }), '/contacto'),
    ).toBe('/contacto');
  });

  it('falls back when the browser sends no referer', () => {
    expect(resolveReturnPath(request({}), '/empleo')).toBe('/empleo');
  });
});

describe('errorRedirectPath', () => {
  it('combines the safe return path with the outcome fragment', () => {
    expect(
      errorRedirectPath(
        request({ referer: 'https://site.example/empleo' }),
        '/contacto',
        'rate_limited',
      ),
    ).toBe('/empleo#error-limite');
  });

  it('never emits an absolute URL, even from a hostile referer', () => {
    const path = errorRedirectPath(
      request({ referer: 'https://evil.example/x' }),
      '/contacto',
      'validation_failed',
    );
    expect(path.startsWith('/')).toBe(true);
    expect(path.startsWith('//')).toBe(false);
    expect(path).toBe('/contacto#error-validacion');
  });
});

describe('seeOther — POST/redirect/GET', () => {
  it('is a 303 to the given site-relative location and is uncacheable', () => {
    const response = seeOther(SUCCESS_PATH, 'req-1');
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/contacto/gracias');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-request-id')).toBe('req-1');
  });
});
