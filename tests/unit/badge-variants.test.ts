import { describe, it, expect } from 'vitest';
import { badgeVariants } from '@/lib/ui/badge-variants';

describe('badgeVariants', () => {
  it('defaults to the sector variant, pill shape, body-sm', () => {
    const c = badgeVariants();
    expect(c).toContain('rounded-full');
    expect(c).toContain('text-body-sm');
    expect(c).toContain('bg-gray-100');
  });

  it('maps each DS variant to its fill/text', () => {
    expect(badgeVariants({ variant: 'service' })).toContain('bg-blue-100');
    expect(badgeVariants({ variant: 'service' })).toContain('text-blue-800');
    expect(badgeVariants({ variant: 'success' })).toContain('bg-green-50');
    expect(badgeVariants({ variant: 'success' })).toContain('text-success');
  });

  it('merges extra classes', () => {
    expect(badgeVariants({ class: 'uppercase' })).toContain('uppercase');
  });
});
