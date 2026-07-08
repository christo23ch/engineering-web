import { describe, it, expect } from 'vitest';
import { cardVariants } from '@/lib/ui/card-variants';

describe('cardVariants', () => {
  it('base: surface, gray-300 border, radius-lg, padding by default', () => {
    const c = cardVariants();
    expect(c).toContain('bg-surface');
    expect(c).toContain('border-border');
    expect(c).toContain('rounded-lg');
    expect(c).toContain('p-6');
  });

  it('padding none removes padding', () => {
    expect(cardVariants({ padding: 'none' })).not.toContain('p-6');
  });

  it('interactive adds hover border + shadow', () => {
    const c = cardVariants({ interactive: true });
    expect(c).toContain('hover:border-blue-600');
    expect(c).toContain('hover:shadow-md');
  });

  it('non-interactive has no hover affordance', () => {
    expect(cardVariants({ interactive: false })).not.toContain(
      'hover:shadow-md',
    );
  });
});
