/**
 * Lead submission validation (RF-06/07 contact form, RF-13 lead magnet).
 * Two shapes discriminated by `tipo`; the contact form omits it (default),
 * the LeadMagnet block will post tipo=lead_magnet + recurso when wired.
 * `servicio` is checked against the real §24 service taxonomy so a lead can
 * never reference a service line that does not exist.
 */
import { z } from 'zod';
import { services } from '@/lib/content/services';
import { AppError } from '@/server/http/errors';
import {
  consentField,
  emailField,
  optionalTrimmed,
  parseWith,
  slugField,
  trimmedString,
} from '@/server/validation/common';

const serviceSlugs = new Set(services.map((service) => service.slug));

const contactSchema = z.object({
  nombre: trimmedString(
    'obligatorio',
    2,
    'demasiado corto (mín. 2 caracteres)',
    120,
    'demasiado largo (máx. 120 caracteres)',
  ),
  email: emailField,
  empresa: optionalTrimmed(160, 'demasiado largo (máx. 160 caracteres)'),
  servicio: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '')
        return undefined;
      return value;
    },
    z
      .string()
      .refine((slug) => serviceSlugs.has(slug), 'servicio no reconocido')
      .optional(),
  ),
  mensaje: trimmedString(
    'obligatorio',
    10,
    'demasiado corto (mín. 10 caracteres)',
    5000,
    'demasiado largo (máx. 5000 caracteres)',
  ),
  consentimiento: consentField,
});

const magnetSchema = z.object({
  email: emailField,
  recurso: slugField('obligatorio'),
  consentimiento: consentField,
});

export interface ContactLeadInput {
  kind: 'contact';
  nombre: string;
  email: string;
  empresa?: string;
  servicio?: string;
  mensaje: string;
}

export interface MagnetLeadInput {
  kind: 'lead_magnet';
  email: string;
  recurso: string;
}

export type LeadInput = ContactLeadInput | MagnetLeadInput;

export function parseLeadSubmission(body: Record<string, unknown>): LeadInput {
  const tipo = body['tipo'] ?? 'contacto';

  if (tipo === 'contacto') {
    const data = parseWith(contactSchema, body);
    return {
      kind: 'contact',
      nombre: data.nombre,
      email: data.email,
      empresa: data.empresa,
      servicio: data.servicio,
      mensaje: data.mensaje,
    };
  }

  if (tipo === 'lead_magnet') {
    const data = parseWith(magnetSchema, body);
    return { kind: 'lead_magnet', email: data.email, recurso: data.recurso };
  }

  throw AppError.validation(['tipo: no reconocido']);
}
