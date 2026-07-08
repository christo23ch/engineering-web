import { describe, it, expect } from 'vitest';
import { resolveFieldId, fieldParts, describedBy } from '@/lib/ui/field';

describe('field helpers', () => {
  it('resolveFieldId prefers explicit id, then name, then random', () => {
    expect(resolveFieldId('x')).toBe('x');
    expect(resolveFieldId(undefined, 'email')).toBe('field-email');
    expect(resolveFieldId()).toMatch(/^field-[a-z0-9]+$/);
  });

  it('fieldParts derives help/error ids', () => {
    expect(fieldParts('f')).toEqual({
      id: 'f',
      helpId: 'f-help',
      errorId: 'f-error',
    });
  });

  it('describedBy joins truthy ids and drops empties', () => {
    expect(describedBy('a', false, undefined, 'b')).toBe('a b');
    expect(describedBy(false, undefined)).toBeUndefined();
  });
});
