import { describe, it, expect } from 'vitest';
import { buttonVariants } from '@/lib/ui/button-variants';

describe('buttonVariants', () => {
  it('defaults to primary + md', () => {
    const c = buttonVariants();
    expect(c).toContain('bg-action');
    expect(c).toContain('text-on-action');
    expect(c).toContain('h-11'); // md = 44px
    expect(c).toContain('rounded-md');
  });

  it('renders each variant with its DS treatment', () => {
    expect(buttonVariants({ variant: 'primary' })).toContain('bg-action');
    expect(buttonVariants({ variant: 'secondary' })).toContain('border-action');
    expect(buttonVariants({ variant: 'secondary' })).toContain(
      'bg-transparent',
    );
    expect(buttonVariants({ variant: 'tertiary' })).toContain('text-action');
    expect(buttonVariants({ variant: 'tertiary' })).not.toContain(
      'border-action',
    );
  });

  it('renders the inverted variant (white fill + blue-800 text) for dark CTAs', () => {
    const c = buttonVariants({ variant: 'inverted' });
    expect(c).toContain('bg-white');
    expect(c).toContain('text-blue-800');
    // It is a solid chip, not the primary action fill nor a bordered button.
    expect(c).not.toContain('bg-action');
    expect(c).not.toContain('border-action');
    // Shares the base disabled affordances (no duplication / override needed).
    expect(c).toContain('disabled:bg-gray-300');
  });

  it('maps sizes to the DS touch scale (36/44/52)', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-9');
    expect(buttonVariants({ size: 'md' })).toContain('h-11');
    expect(buttonVariants({ size: 'lg' })).toContain('h-13');
  });

  it('always includes disabled affordances (native + anchor marker)', () => {
    const c = buttonVariants();
    expect(c).toContain('disabled:cursor-not-allowed');
    expect(c).toContain('data-[disabled=true]:cursor-not-allowed');
  });

  it('merges extra classes last, resolving conflicts', () => {
    // Consumer overrides the height → tailwind-merge keeps the last one.
    const c = buttonVariants({ size: 'md', class: 'h-14' });
    expect(c).toContain('h-14');
    expect(c).not.toContain('h-11');
  });
});
