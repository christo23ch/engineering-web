/**
 * Form-field accessibility helpers (DESIGN_SYSTEM §11.3, Bible §20).
 * Shared by Input / Textarea / Select so id + aria wiring stays consistent:
 * visible <label for>, help/error linked via aria-describedby, aria-invalid on
 * error. Zero JS — ids are resolved at build time.
 */

/** Stable-ish id for a field: explicit id → name → random (SSG-stable). */
export function resolveFieldId(id?: string, name?: string): string {
  if (id) return id;
  if (name) return `field-${name}`;
  return `field-${Math.random().toString(36).slice(2, 10)}`;
}

/** Derived ids for the help text and error message of a field. */
export function fieldParts(fieldId: string) {
  return {
    id: fieldId,
    helpId: `${fieldId}-help`,
    errorId: `${fieldId}-error`,
  };
}

/** Compose aria-describedby from optional pieces; undefined when empty. */
export function describedBy(
  ...ids: Array<string | false | null | undefined>
): string | undefined {
  const value = ids.filter((x): x is string => Boolean(x)).join(' ');
  return value === '' ? undefined : value;
}
