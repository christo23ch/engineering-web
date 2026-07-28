import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LeadMagnet from '@/components/content/LeadMagnet.astro';

// Lead magnet capture block (DESIGN_SYSTEM §13.6, RF-13): email + consent from
// the approved §11.3 primitives, posting natively to the BFF with the
// `lead_magnet` schema discriminator and a real capture attribution.
async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(LeadMagnet, { props });
}

describe('LeadMagnet (content/LeadMagnet.astro)', () => {
  it('renders a minimal email + consent capture form', async () => {
    const html = await render();
    expect(html).toContain('<form');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="consentimiento"');
    expect(html).toContain('/legal/privacidad');
    expect(html).toContain('type="submit"');
  });

  it('posts natively to the leads endpoint with the magnet schema fields', async () => {
    const html = await render();
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/api/leads"');
    expect(html).toContain('name="tipo" value="lead_magnet"');
    // `recurso` is required by the magnet schema; the index block attributes
    // the capture to the generic subscription.
    expect(html).toContain('name="recurso" value="suscripcion-general"');
    expect(html).toContain('name="website"');
  });

  it('attributes the capture to the hosting article when given a slug', async () => {
    const html = await render({ recurso: 'auditoria-energetica' });
    expect(html).toContain('name="recurso" value="auditoria-energetica"');
    // Field ids stay unique per instance so several blocks can coexist.
    expect(html).toContain('id="magnet-email-auditoria-energetica"');
  });

  it('ships no script (zero-JS discipline)', async () => {
    expect(await render()).not.toContain('<script');
  });
});
