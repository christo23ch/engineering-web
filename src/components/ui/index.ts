/**
 * Public component surface of the Design System (docs/DESIGN_SYSTEM.md §11).
 * Consumers import from '@/components/ui'; this barrel is the curated API.
 *
 * Encapsulated on purpose (NOT re-exported): FieldShell and FieldMessage are
 * composition scaffolds that only make sense inside a form control's markup
 * contract (Input/Select/Textarea/Checkbox/Radio). Use those controls instead.
 */
export { default as Alert } from './Alert.astro';
export { default as Badge } from './Badge.astro';
export { default as Button } from './Button.astro';
export { default as Card } from './Card.astro';
export { default as Checkbox } from './Checkbox.astro';
export { default as Icon } from './Icon.astro';
export { default as Input } from './Input.astro';
export { default as Loading } from './Loading.astro';
export { default as Modal } from './Modal.astro';
export { default as Radio } from './Radio.astro';
export { default as Select } from './Select.astro';
export { default as Skeleton } from './Skeleton.astro';
export { default as Spinner } from './Spinner.astro';
export { default as Textarea } from './Textarea.astro';
