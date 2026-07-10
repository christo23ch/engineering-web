import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LeadMagnet from '@/components/content/LeadMagnet.astro';

// Lead magnet capture block (DESIGN_SYSTEM §13.6, RF-13). Interface only: email
// + consent built from the approved §11.3 primitives; the submit is deferred.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(LeadMagnet);
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
});
