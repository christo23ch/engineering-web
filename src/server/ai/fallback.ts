/**
 * User-facing IA outcomes (Bible §16). Three honest states — the widget
 * always shows something useful and never fabricates:
 *
 *  - answered: a RAG answer with mandatory citations.
 *  - refused:  on-domain but the content has no answer → the fixed refusal
 *    sentence, pointing to the contact form.
 *  - fallback: the assistant is unavailable (not configured, budget blocked,
 *    upstream error, or a guardrail rejection) → an honest "can't answer now,
 *    use search or contact" message. Never an invented answer.
 */
import { REFUSAL_SENTENCE } from '@/server/ai/prompt';

export const FALLBACK_MESSAGE =
  'Ahora mismo no puedo responder a tu consulta con el asistente. Puedes usar el buscador del sitio o escribirnos a través del formulario de contacto y te responderá una persona del equipo.';

export { REFUSAL_SENTENCE };

/** Suggested next-step links for the fallback/refusal UI (zero fabrication). */
export const HELP_LINKS = [
  { label: 'Buscar en el sitio', url: '/buscar' },
  { label: 'Contactar con el equipo', url: '/contacto' },
] as const;
