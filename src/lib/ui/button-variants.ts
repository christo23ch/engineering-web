import { cn } from '@/lib/utils/cn';

/**
 * Button variant resolver — maps design-system variants/sizes to Tailwind
 * utility classes (docs/DESIGN_SYSTEM.md §11.1 + §10). Framework-agnostic so an
 * Astro component and a future React island share one source of styling truth.
 *
 * Pattern inspired by class-variance-authority / shadcn's variant approach;
 * written from scratch, no copied code.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Base — shared by every button. The focus ring is applied globally to all
// interactive elements (src/styles/globals.css, DESIGN_SYSTEM §10), so it is
// intentionally NOT repeated here (single system-wide definition). Disabled
// styling covers both the native `disabled` attribute (buttons) and the
// `data-disabled` marker (anchors, which have no disabled attribute).
const base = cn(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold',
  'whitespace-nowrap select-none transition-colors',
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-300 disabled:text-gray-500',
  'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:border-transparent data-[disabled=true]:bg-gray-300 data-[disabled=true]:text-gray-500',
);

const byVariant: Record<ButtonVariant, string> = {
  // Primary CTA — one per view (DESIGN_SYSTEM P3 / §11.1).
  primary:
    'bg-action text-on-action hover:bg-action-hover active:bg-action-hover',
  // Secondary — 1.5px action border, transparent fill.
  secondary:
    'border-[1.5px] border-action bg-transparent text-action hover:bg-blue-50 active:bg-blue-100',
  // Tertiary / ghost — text only, low hierarchy.
  tertiary: 'bg-transparent text-action hover:bg-blue-50 active:bg-blue-100',
};

// Heights map to the DS touch scale: sm 36px · md 44px · lg 52px (§11.1, §6).
const bySize: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-6 text-body',
  lg: 'h-13 px-8 text-body-lg',
};

export interface ButtonVariantProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Extra classes, merged last (conflicts win over defaults). */
  class?: string;
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  class: extra,
}: ButtonVariantProps = {}): string {
  return cn(base, byVariant[variant], bySize[size], extra);
}
