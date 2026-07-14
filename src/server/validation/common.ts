/**
 * Shared validation building blocks (Bible §17: validate at the boundary).
 * Field names and messages are Spanish (ADR-009: ES-only MVP) and match the
 * APPROVED §13 form markup verbatim (nombre, email, empresa, servicio,
 * mensaje, consentimiento…), so wiring the zero-JS forms needs no renaming.
 */
import { z } from 'zod';
import { AppError } from '@/server/http/errors';

export const trimmedString = (
  required: string,
  min: number,
  minMsg: string,
  max: number,
  maxMsg: string,
) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string(required).min(min, minMsg).max(max, maxMsg),
  );

export const optionalTrimmed = (max: number, maxMsg: string) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().max(max, maxMsg).optional());

export const emailField = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z
    .email('introduce un email válido')
    .max(254, 'demasiado largo (máx. 254 caracteres)'),
);

/**
 * GDPR consent (Bible §21): the checkbox must be actively checked. Accepts
 * the browser form value ('on'), a JSON boolean, or the string 'true'; any
 * other value — including absence — fails.
 */
export const consentField = z
  .union(
    [z.literal(true), z.literal('on'), z.literal('true')],
    'debes aceptar la política de privacidad',
  )
  .transform(() => true as const);

/** URL-slug shape (Bible §24 routes): lowercase, hyphen-separated. */
export const slugField = (required: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z
      .string(required)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'formato de identificador no válido')
      .max(96, 'demasiado largo (máx. 96 caracteres)'),
  );

/**
 * Honeypot (Bible §17 anti-abuse): the hidden `website` field must stay
 * empty. A filled value is NOT a validation error — callers fake-accept and
 * drop, so bots learn nothing.
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body['website'];
  return typeof value === 'string' && value.trim() !== '';
}

/** Convert a zod failure into the client-safe 400 with per-field details. */
export function toValidationError(error: z.ZodError): AppError {
  const details = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return `${path}: ${issue.message}`;
  });
  return AppError.validation(details);
}

export function parseWith<Schema extends z.ZodType>(
  schema: Schema,
  body: Record<string, unknown>,
): z.output<Schema> {
  const result = schema.safeParse(body);
  if (!result.success) throw toValidationError(result.error);
  return result.data;
}
