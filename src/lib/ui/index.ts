/**
 * Public styling API of the Design System: the framework-agnostic variant
 * resolvers (shared by the Astro components and future React islands, ADR-002)
 * and the types consumers annotate props with.
 *
 * Encapsulated on purpose (NOT re-exported): the icon registry (`icons`,
 * `IconNode`), the alert icon/colour/role maps, `controlBox`, and the field-id
 * helpers (`field.ts`) are internal implementation details — consumers use the
 * components, not these primitives.
 */
export { buttonVariants } from './button-variants';
export type { ButtonVariant, ButtonSize } from './button-variants';

export { badgeVariants } from './badge-variants';
export type { BadgeVariant } from './badge-variants';

export { alertVariants } from './alert-variants';
export type { AlertVariant } from './alert-variants';

export { cardVariants } from './card-variants';
export type { CardPadding } from './card-variants';

export { skeletonVariants } from './skeleton-variants';
export type { SkeletonVariant } from './skeleton-variants';

export type { IconName } from './icons';
