import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge configured with the design system's custom font-size scale
 * (docs/DESIGN_SYSTEM.md §4.2). Without this, merge treats `text-body`,
 * `text-h1`, … as `text-*` color utilities and drops the actual text color
 * (e.g. `text-on-action`) when both are present. Registering them as font-size
 * keeps color and size in separate conflict groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'overline',
            'body',
            'body-sm',
            'body-lg',
            'h1',
            'h2',
            'h3',
            'h4',
            'display',
          ],
        },
      ],
    },
  },
});

/**
 * Merge Tailwind class names, resolving conflicts (last wins).
 * Infrastructure utility used by UI components (docs/DESIGN_SYSTEM.md §11).
 *
 * @example cn('px-2', condition && 'px-4') // -> 'px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
