import { cn } from '@/lib/utils/cn';

/**
 * Skeleton variants (DESIGN_SYSTEM §11.6): gray-100 placeholder blocks with a
 * soft pulse ("shimmer suave"). The pulse is opacity-based (animate-pulse) —
 * lighter on paint than a moving gradient and neutralised under
 * prefers-reduced-motion by the global rule (src/styles/globals.css, Bible §20).
 *
 * - text   → a line of text (set width via class)
 * - block  → a generic rectangle (set width/height via class)
 * - circle → an avatar/round placeholder (set size via class)
 */
export type SkeletonVariant = 'text' | 'block' | 'circle';

const base = 'animate-pulse bg-gray-100';

const byVariant: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-sm',
  block: 'rounded-md',
  circle: 'rounded-full',
};

export function skeletonVariants({
  variant = 'block',
  class: extra,
}: { variant?: SkeletonVariant; class?: string } = {}): string {
  return cn(base, byVariant[variant], extra);
}
