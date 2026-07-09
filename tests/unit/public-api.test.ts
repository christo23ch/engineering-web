import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import * as libUi from '@/lib/ui';
import * as libUtils from '@/lib/utils';
import { Button, Icon } from '@/components/ui';

// Locks the Design System's public API (Iteration 3.8.4): the barrels expose
// exactly the intended surface and keep internal primitives encapsulated.

describe('public API — @/lib/ui barrel', () => {
  it('exposes the framework-agnostic variant resolvers', () => {
    expect(typeof libUi.buttonVariants).toBe('function');
    expect(typeof libUi.badgeVariants).toBe('function');
    expect(typeof libUi.alertVariants).toBe('function');
    expect(typeof libUi.cardVariants).toBe('function');
    expect(typeof libUi.skeletonVariants).toBe('function');
  });

  it('keeps internal primitives encapsulated', () => {
    // Icon registry, field helpers, control box and alert maps are NOT public;
    // consumers use the components, not these building blocks.
    for (const internal of [
      'icons',
      'controlBox',
      'resolveFieldId',
      'fieldParts',
      'describedBy',
      'alertIcon',
      'alertIconColor',
      'alertRole',
    ]) {
      expect(internal in libUi).toBe(false);
    }
  });
});

describe('public API — @/lib/utils barrel', () => {
  it('exposes cn and nothing else', () => {
    expect(typeof libUtils.cn).toBe('function');
    expect(Object.keys(libUtils)).toEqual(['cn']);
  });
});

describe('public API — @/components/ui barrel', () => {
  it('re-exports components that render through the barrel', async () => {
    const container = await AstroContainer.create();
    const button = await container.renderToString(Button, {
      slots: { default: 'Solicitar propuesta' },
    });
    expect(button).toContain('Solicitar propuesta');
    expect(button).toContain('bg-action'); // primary default (§11.1)

    const icon = await container.renderToString(Icon, {
      props: { name: 'chevron-down' },
    });
    expect(icon).toContain('viewBox="0 0 24 24"'); // §7 grid
  });
});
