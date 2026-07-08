import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts (last wins).
 * Infrastructure utility used by UI components (docs/DESIGN_SYSTEM.md §11).
 *
 * @example cn('px-2', condition && 'px-4') // -> 'px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
