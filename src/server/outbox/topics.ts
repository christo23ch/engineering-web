/**
 * Outbox topics (ADR-010) — the closed set of asynchronous deliveries the
 * BFF performs after a capture is durably persisted (ADR-008):
 *
 * - lead.deliver.crm        → Brevo contact upsert (DA-2)
 * - lead.notify.internal    → email to the internal inbox (EMAIL_TO_INTERNAL)
 * - lead.confirm.email      → acknowledgement email to the requester (DA-8)
 * - candidature.notify.internal → internal email only — recruitment data
 *   never syncs to the CRM (separate GDPR purpose, Bible §21).
 */

export const OUTBOX_TOPICS = {
  leadDeliverCrm: 'lead.deliver.crm',
  leadNotifyInternal: 'lead.notify.internal',
  leadConfirmEmail: 'lead.confirm.email',
  candidatureNotifyInternal: 'candidature.notify.internal',
} as const;

export type OutboxTopic = (typeof OUTBOX_TOPICS)[keyof typeof OUTBOX_TOPICS];

/** Payload for the three lead.* topics. */
export interface LeadOutboxPayload {
  leadId: string;
  kind: 'contact' | 'lead_magnet';
  email: string;
  nombre?: string;
  empresa?: string;
  servicio?: string;
  recurso?: string;
  mensaje?: string;
}

export interface CandidatureOutboxPayload {
  candidatureId: string;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
}
