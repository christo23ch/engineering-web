import { cn } from '@/lib/utils/cn';

/**
 * Badge / chip variants (DESIGN_SYSTEM §11.5): radius-full, body-sm. Semantic
 * variants map to the taxonomy uses — sector (neutral), service (blue),
 * success/metric (green). All AA-verified on their fills (§3.3).
 */
export type BadgeVariant = 'sector' | 'service' | 'success';

const base = cn(
  'inline-flex items-center gap-1 rounded-full px-3 py-0.5',
  'text-body-sm font-medium',
);

const byVariant: Record<BadgeVariant, string> = {
  sector: 'bg-gray-100 text-text-secondary', // gray-600 on gray-100
  service: 'bg-blue-100 text-blue-800', // blue-800 on blue-100
  success: 'bg-green-50 text-success', // green-700 on green-50 (savings)
};

export function badgeVariants({
  variant = 'sector',
  class: extra,
}: { variant?: BadgeVariant; class?: string } = {}): string {
  return cn(base, byVariant[variant], extra);
}
