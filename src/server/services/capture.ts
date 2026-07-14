/**
 * Capture use-cases (ADR-008 + ADR-010): the single write path for both
 * funnels. One transaction per capture — subject row + GDPR consent + the
 * outbox jobs that deliver it. If anything fails, nothing was captured; if
 * it commits, delivery is guaranteed-or-dead-lettered by the worker.
 *
 * Delivery fan-out:
 * - contact / lead magnet → CRM upsert + internal notification + requester
 *   acknowledgement (three independent jobs — a CRM outage never blocks the
 *   internal email).
 * - candidature → internal notification ONLY (recruitment data never syncs
 *   to the CRM — Bible §21, separate purpose).
 */
import type { DbClient } from '@/server/db/client';
import { insertCandidature } from '@/server/db/repositories/candidatures';
import {
  insertConsent,
  PRIVACY_POLICY_VERSION,
} from '@/server/db/repositories/consents';
import { insertLead } from '@/server/db/repositories/leads';
import { enqueueOutbox } from '@/server/outbox/repository';
import {
  OUTBOX_TOPICS,
  type CandidatureOutboxPayload,
  type LeadOutboxPayload,
} from '@/server/outbox/topics';
import type { CandidatureInput } from '@/server/validation/candidatures';
import type { LeadInput } from '@/server/validation/leads';

export interface CaptureContext {
  /** Pseudonymized (SHA-256) — never the raw IP (GDPR §21). */
  ipHash?: string;
  userAgent?: string;
  /** Referer of the submitting page (attribution). */
  sourceUrl?: string;
}

export async function captureLead(
  db: DbClient,
  input: LeadInput,
  context: CaptureContext = {},
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const { id } = await insertLead(
      tx,
      input.kind === 'contact'
        ? {
            kind: 'contact',
            email: input.email,
            name: input.nombre,
            company: input.empresa,
            serviceSlug: input.servicio,
            message: input.mensaje,
            sourceUrl: context.sourceUrl,
          }
        : {
            kind: 'lead_magnet',
            email: input.email,
            resourceSlug: input.recurso,
            sourceUrl: context.sourceUrl,
          },
    );

    await insertConsent(tx, {
      subjectEmail: input.email,
      purpose: input.kind === 'contact' ? 'contact' : 'lead_magnet',
      granted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      leadId: id,
      ipHash: context.ipHash,
      userAgent: context.userAgent,
    });

    const payload: LeadOutboxPayload =
      input.kind === 'contact'
        ? {
            leadId: id,
            kind: 'contact',
            email: input.email,
            nombre: input.nombre,
            empresa: input.empresa,
            servicio: input.servicio,
            mensaje: input.mensaje,
          }
        : {
            leadId: id,
            kind: 'lead_magnet',
            email: input.email,
            recurso: input.recurso,
          };
    const record = payload as unknown as Record<string, unknown>;

    await enqueueOutbox(tx, OUTBOX_TOPICS.leadDeliverCrm, record);
    await enqueueOutbox(tx, OUTBOX_TOPICS.leadNotifyInternal, record);
    await enqueueOutbox(tx, OUTBOX_TOPICS.leadConfirmEmail, record);

    return { id };
  });
}

export async function captureCandidature(
  db: DbClient,
  input: CandidatureInput,
  context: CaptureContext = {},
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const { id } = await insertCandidature(tx, {
      name: input.nombre,
      email: input.email,
      phone: input.telefono,
      message: input.mensaje,
      sourceUrl: context.sourceUrl,
    });

    await insertConsent(tx, {
      subjectEmail: input.email,
      purpose: 'recruitment',
      granted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      candidatureId: id,
      ipHash: context.ipHash,
      userAgent: context.userAgent,
    });

    const payload: CandidatureOutboxPayload = {
      candidatureId: id,
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      mensaje: input.mensaje,
    };
    await enqueueOutbox(
      tx,
      OUTBOX_TOPICS.candidatureNotifyInternal,
      payload as unknown as Record<string, unknown>,
    );

    return { id };
  });
}
