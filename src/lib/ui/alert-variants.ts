import { cn } from '@/lib/utils/cn';

/**
 * Alert variants (DESIGN_SYSTEM §11.6, colours §3.3). Four semantic tones with a
 * tinted background + coloured left accent + coloured icon; body text stays
 * text-primary (dark) for AA on the light tint (colour is never the only signal
 * — there is always an icon + text). The static Alert is zero-JS; dismissible
 * auto-dismissing toasts are a separate future island.
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const base = cn(
  'flex items-start gap-3 rounded-md border-l-4 p-4',
  'text-body text-text-primary',
);

const byVariant: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-action',
  success: 'bg-green-50 border-success',
  warning: 'bg-amber-50 border-warning',
  error: 'bg-red-50 border-error',
};

/** Icon colour per variant (semantic accent). */
export const alertIconColor: Record<AlertVariant, string> = {
  info: 'text-action',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

/**
 * Assertive roles interrupt the screen reader; reserve them for problems.
 * info/success announce politely (status), warning/error assertively (alert).
 */
export const alertRole: Record<AlertVariant, 'status' | 'alert'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

export function alertVariants({
  variant = 'info',
  class: extra,
}: { variant?: AlertVariant; class?: string } = {}): string {
  return cn(base, byVariant[variant], extra);
}
