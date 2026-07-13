import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import IaAssistant from '@/components/ia/IaAssistant.astro';
import Legal from '@/pages/legal/[slug].astro';
import { getLegalPage } from '@/lib/content/legal';

// IA assistant widget (DESIGN_SYSTEM §11.7/§13.11). Interface only: native
// <details> trigger + a coming-soon panel, no functional input, no fabricated
// answers/sources, no IA logic.
async function render(
  Component: Parameters<AstroContainer['renderToString']>[0],
  props?: Record<string, unknown>,
) {
  const container = await AstroContainer.create();
  return container.renderToString(Component, props ? { props } : undefined);
}

describe('IA assistant (ia/IaAssistant.astro)', () => {
  it('renders a native trigger + panel, no functional input or IA logic', async () => {
    const html = await render(IaAssistant);
    expect(html).toContain('<details');
    expect(html).toContain('Pregúntanos');
    expect(html).toContain('próximamente');
    // No chat input / form is wired yet.
    expect(html).not.toContain('<form');
    // JSON-LD (RF-11) is data, not executable script; only it is allowed.
    expect(html).not.toMatch(/<script(?!\s+type="application\/ld\+json")/);
  });

  it('is omitted on legal pages (§13.11)', async () => {
    const html = await render(Legal, { page: getLegalPage('privacidad') });
    expect(html).not.toContain('class="ia-widget');
  });
});
