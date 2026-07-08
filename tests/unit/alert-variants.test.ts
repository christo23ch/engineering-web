import { describe, it, expect } from 'vitest';
import { alertVariants, alertRole } from '@/lib/ui/alert-variants';

describe('alertVariants', () => {
  it('defaults to info tint', () => {
    expect(alertVariants()).toContain('bg-blue-50');
    expect(alertVariants()).toContain('border-action');
  });

  it('maps each variant to its tint + accent', () => {
    expect(alertVariants({ variant: 'success' })).toContain('bg-green-50');
    expect(alertVariants({ variant: 'warning' })).toContain('bg-amber-50');
    expect(alertVariants({ variant: 'error' })).toContain('bg-red-50');
    expect(alertVariants({ variant: 'error' })).toContain('border-error');
  });

  it('keeps body text dark for AA on the tint', () => {
    expect(alertVariants({ variant: 'error' })).toContain('text-text-primary');
  });

  it('assigns polite/assertive roles by severity', () => {
    expect(alertRole.info).toBe('status');
    expect(alertRole.success).toBe('status');
    expect(alertRole.warning).toBe('alert');
    expect(alertRole.error).toBe('alert');
  });
});
