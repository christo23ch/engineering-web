/**
 * Outbox topic handlers (ADR-010 → ADR-008 deliveries via Brevo, §49
 * DA-2/DA-8). Built from the §38 config; the fetch implementation is
 * injectable for tests.
 *
 * Capability policy: a missing integration (no CRM key yet, no internal
 * inbox…) raises a TRANSIENT error — configuration can land at any moment,
 * so the event retries with backoff and, if it never does, dead-letters with
 * an explicit reason (kept for replay). Malformed payloads are permanent: a
 * retry cannot fix them.
 */
import { z } from 'zod';
import type { ServerConfig } from '@/server/config';
import {
  candidatureInternalNotification,
  leadConfirmation,
  leadInternalNotification,
} from '@/server/email/templates';
import { IntegrationError } from '@/server/http/errors';
import {
  createBrevoClient,
  type BrevoClient,
} from '@/server/integrations/brevo/client';
import { upsertContact } from '@/server/integrations/brevo/contacts';
import { sendEmail } from '@/server/integrations/brevo/email';
import { OUTBOX_TOPICS } from '@/server/outbox/topics';
import type { OutboxHandlerRegistry } from '@/server/outbox/worker';

const leadPayloadSchema = z.object({
  leadId: z.string(),
  kind: z.union([z.literal('contact'), z.literal('lead_magnet')]),
  email: z.string(),
  nombre: z.string().optional(),
  empresa: z.string().optional(),
  servicio: z.string().optional(),
  recurso: z.string().optional(),
  mensaje: z.string().optional(),
});

const candidaturePayloadSchema = z.object({
  candidatureId: z.string(),
  nombre: z.string(),
  email: z.string(),
  telefono: z.string().optional(),
  mensaje: z.string().optional(),
});

function parsePayload<Schema extends z.ZodType>(
  schema: Schema,
  payload: Record<string, unknown>,
): z.output<Schema> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    // Permanent: the payload was written by us; a retry cannot fix it.
    throw new IntegrationError('outbox', 'malformed payload', {
      retryable: false,
      cause: result.error,
    });
  }
  return result.data;
}

function transientGap(what: string): IntegrationError {
  return new IntegrationError('config', `${what} not configured yet`, {
    retryable: true,
  });
}

export interface OutboxHandlerDeps {
  config: ServerConfig;
  fetchImpl?: typeof fetch;
}

export function buildOutboxHandlers(
  deps: OutboxHandlerDeps,
): OutboxHandlerRegistry {
  const { config, fetchImpl } = deps;

  const crmClient = (): BrevoClient => {
    if (!config.crm) throw transientGap('crm capability');
    return createBrevoClient({ ...config.crm, fetchImpl });
  };
  // DA-8: transactional email is also Brevo but holds its own credential.
  const emailClient = (): BrevoClient => {
    if (!config.email) throw transientGap('email capability');
    return createBrevoClient({
      apiBase: config.crm?.apiBase ?? 'https://api.brevo.com/v3',
      apiKey: config.email.apiKey,
      fetchImpl,
    });
  };

  return {
    [OUTBOX_TOPICS.leadDeliverCrm]: async (payload) => {
      const lead = parsePayload(leadPayloadSchema, payload);
      await upsertContact(crmClient(), {
        email: lead.email,
        nombre: lead.nombre,
        empresa: lead.empresa,
        servicio: lead.servicio,
        recurso: lead.recurso,
        origen: lead.kind === 'contact' ? 'contacto' : 'lead_magnet',
      });
    },

    [OUTBOX_TOPICS.leadNotifyInternal]: async (payload) => {
      const lead = parsePayload(leadPayloadSchema, payload);
      const email = config.email;
      if (!email) throw transientGap('email capability');
      if (!email.toInternal) throw transientGap('EMAIL_TO_INTERNAL');
      const content = leadInternalNotification(lead);
      await sendEmail(emailClient(), {
        from: email.from,
        to: email.toInternal,
        ...content,
      });
    },

    [OUTBOX_TOPICS.leadConfirmEmail]: async (payload) => {
      const lead = parsePayload(leadPayloadSchema, payload);
      const email = config.email;
      if (!email) throw transientGap('email capability');
      const content = leadConfirmation(lead);
      await sendEmail(emailClient(), {
        from: email.from,
        to: lead.email,
        ...content,
      });
    },

    [OUTBOX_TOPICS.candidatureNotifyInternal]: async (payload) => {
      const candidature = parsePayload(candidaturePayloadSchema, payload);
      const email = config.email;
      if (!email) throw transientGap('email capability');
      if (!email.toInternal) throw transientGap('EMAIL_TO_INTERNAL');
      const content = candidatureInternalNotification(candidature);
      await sendEmail(emailClient(), {
        from: email.from,
        to: email.toInternal,
        ...content,
      });
    },
  };
}
