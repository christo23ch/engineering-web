import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils/cn';

// Smoke tests for the class-name utility (infrastructure). Confirms the unit
// test harness is wired (docs/PROJECT_BIBLE.md §32).
describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves conflicting Tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});
