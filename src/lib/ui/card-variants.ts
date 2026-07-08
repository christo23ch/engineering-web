import { cn } from '@/lib/utils/cn';

/**
 * Card container variants (DESIGN_SYSTEM §11.2 / §8). Base surface + gray-300
 * border + radius-lg. When the whole card is a single link it becomes
 * interactive: hover raises border to blue-600 + shadow-md (§11.2 service card).
 * Concrete cards (service/case/article/metric/person) compose this primitive.
 */
export type CardPadding = 'none' | 'md';

export function cardVariants({
  interactive = false,
  padding = 'md',
  class: extra,
}: {
  interactive?: boolean;
  padding?: CardPadding;
  class?: string;
} = {}): string {
  return cn(
    'block rounded-lg border border-border bg-surface',
    padding === 'md' && 'p-6',
    // `transition` (not transition-colors + transition-shadow, which would
    // collide in tailwind-merge) covers both border and shadow at ~150ms
    // (DS duration-fast). Neutralized under reduced-motion globally.
    interactive &&
      'transition hover:border-blue-600 hover:shadow-md focus-visible:border-blue-600',
    extra,
  );
}
