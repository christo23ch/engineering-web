import { describe, it, expect } from 'vitest';
import { skeletonVariants } from '@/lib/ui/skeleton-variants';

describe('skeletonVariants', () => {
  it('base: gray-100 fill + soft pulse (reduced-motion handled globally)', () => {
    const c = skeletonVariants();
    expect(c).toContain('bg-gray-100');
    expect(c).toContain('animate-pulse');
  });

  it('maps each variant to its shape', () => {
    expect(skeletonVariants({ variant: 'text' })).toContain('rounded-sm');
    expect(skeletonVariants({ variant: 'text' })).toContain('h-4');
    expect(skeletonVariants({ variant: 'block' })).toContain('rounded-md');
    expect(skeletonVariants({ variant: 'circle' })).toContain('rounded-full');
  });

  it('merges sizing classes from the consumer', () => {
    const c = skeletonVariants({ variant: 'circle', class: 'size-12' });
    expect(c).toContain('size-12');
    expect(c).toContain('rounded-full');
  });
});
