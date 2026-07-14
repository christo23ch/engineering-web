/**
 * Assistant query validation (Bible §16/§17: validate at the boundary). The
 * question is the only untrusted input; bound its length (cost + abuse) and
 * keep the honeypot discipline shared with the forms.
 */
import { z } from 'zod';
import { parseWith, trimmedString } from '@/server/validation/common';

const querySchema = z.object({
  pregunta: trimmedString(
    'obligatorio',
    3,
    'la pregunta es demasiado corta',
    1000,
    'la pregunta es demasiado larga (máx. 1000 caracteres)',
  ),
});

export interface AssistantInput {
  pregunta: string;
}

export function parseAssistantQuery(
  body: Record<string, unknown>,
): AssistantInput {
  return parseWith(querySchema, body);
}
