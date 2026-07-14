import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Security-header contract (docs/PROJECT_BIBLE.md §17). The HTTP-only headers
// (which a meta CSP cannot express, and which `astro preview` does not replay)
// are served by the host via vercel.json. This test pins that contract so the
// deploy artifact can never silently lose them. The in-page CSP meta is proven
// end-to-end in tests/e2e/security-headers.spec.ts.

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relative: string): string {
  return readFileSync(new URL(relative, `file://${root}`), 'utf8');
}

describe('vercel.json security headers', () => {
  const vercel = JSON.parse(read('vercel.json')) as {
    headers?: Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
  };

  it('applies a headers rule to every route', () => {
    expect(vercel.headers).toBeDefined();
    const globalRule = vercel.headers?.find((r) => r.source === '/(.*)');
    expect(globalRule).toBeDefined();
  });

  const rule = vercel.headers?.find((r) => r.source === '/(.*)');
  const byKey = new Map(
    (rule?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]),
  );

  it('enforces HSTS with a long max-age, subdomains and preload', () => {
    const hsts = byKey.get('strict-transport-security') ?? '';
    expect(hsts).toMatch(/max-age=\d{7,}/); // >= ~4 months
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('denies framing (clickjacking — meta CSP frame-ancestors is ignored)', () => {
    expect(byKey.get('x-frame-options')).toBe('DENY');
  });

  it('blocks MIME sniffing', () => {
    expect(byKey.get('x-content-type-options')).toBe('nosniff');
  });

  it('sets a privacy-preserving referrer policy', () => {
    expect(byKey.get('referrer-policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('locks down powerful features via Permissions-Policy', () => {
    const pp = byKey.get('permissions-policy') ?? '';
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
  });
});

describe('astro.config CSP', () => {
  const config = read('astro.config.ts');

  it('declares a security.csp block with locked-down directives', () => {
    expect(config).toContain('security:');
    expect(config).toContain('csp:');
    expect(config).toContain("default-src 'self'");
    expect(config).toContain("object-src 'none'");
    expect(config).toContain("base-uri 'self'");
    expect(config).toContain("form-action 'self'");
    expect(config).toContain('upgrade-insecure-requests');
  });

  it('never opens an inline execution escape hatch', () => {
    expect(config).not.toContain("'unsafe-inline'");
    expect(config).not.toContain("'unsafe-eval'");
  });
});

describe('the only bundled client script is CSP-safe (auto-hashable)', () => {
  const modal = read('src/components/ui/Modal.astro');
  const script = modal.slice(
    modal.indexOf('<script>'),
    modal.indexOf('</script>') + '</script>'.length,
  );

  it('contains a script block', () => {
    expect(script).toContain('<script>');
  });

  it('uses no dynamic-code or inline-handler constructs a strict CSP would block', () => {
    expect(script).not.toMatch(/\beval\s*\(/);
    expect(script).not.toMatch(/new\s+Function\s*\(/);
    expect(script).not.toMatch(/\bsetTimeout\s*\(\s*['"`]/); // string-body timer
    expect(script).not.toMatch(/\son\w+\s*=/); // inline event attribute
    expect(script).not.toMatch(/javascript:/);
    // Event delegation only — the mechanism that keeps the site zero-JS-by-default.
    expect(script).toContain("addEventListener('click'");
  });
});
