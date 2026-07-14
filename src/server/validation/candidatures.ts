/**
 * Spontaneous candidature validation (RF-14, §13.7). Recruitment data is a
 * separate GDPR purpose (Bible §21) — its own schema, its own consent.
 * CV file upload is deliberately not accepted yet (storage + AV policy
 * pending, §17); the message field can carry a profile link meanwhile.
 */
import { z } from 'zod';
import {
  consentField,
  emailField,
  optionalTrimmed,
  parseWith,
  trimmedString,
} from '@/server/validation/common';

const candidatureSchema = z.object({
  nombre: trimmedString(
    'obligatorio',
    2,
    'demasiado corto (mín. 2 caracteres)',
    120,
    'demasiado largo (máx. 120 caracteres)',
  ),
  email: emailField,
  telefono: z.preprocess(
    (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z
      .string()
      .regex(/^[+0-9][0-9 ()./-]{5,19}$/, 'teléfono no válido')
      .optional(),
  ),
  mensaje: optionalTrimmed(5000, 'demasiado largo (máx. 5000 caracteres)'),
  consentimiento: consentField,
});

export interface CandidatureInput {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
}

export function parseCandidatureSubmission(
  body: Record<string, unknown>,
): CandidatureInput {
  const data = parseWith(candidatureSchema, body);
  return {
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    mensaje: data.mensaje,
  };
}
