import { cn } from '@/lib/utils/cn';

/**
 * Shared box styling for text controls — Input / Textarea / Select
 * (DESIGN_SYSTEM §11.3): border gray-300, radius-sm, white fill, visible label
 * handled by the component. Height (48px) is applied per control since the
 * textarea grows. Error state per §10 (border-error; the message carries an
 * icon + text so colour is never the sole signal, §3.3).
 */
export function controlBox(opts: { error?: boolean; class?: string } = {}) {
  return cn(
    'block w-full rounded-sm border bg-surface px-3 text-body text-text-primary',
    'placeholder:text-text-muted',
    'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
    opts.error ? 'border-error' : 'border-border',
    opts.class,
  );
}
