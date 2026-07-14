/**
 * Consent repository (Bible §28 "Consentimiento", §21 GDPR). Every capture
 * writes an explicit consent record in the same transaction as its subject
 * row (lead XOR candidature — enforced by the DB constraint). The IP is
 * stored pseudonymized only (SHA-256), never raw.
 */
import { createHash } from 'node:crypto';
import type { DbClient } from '@/server/db/client';

export type ConsentPurpose = 'contact' | 'lead_magnet' | 'recruitment';

/**
 * Visible privacy-policy version the subject accepted. The legal text is a
 * provisional placeholder (content honesty — Bible §21/H8); bump this marker
 * when the real policy lands.
 */
export const PRIVACY_POLICY_VERSION = 'privacidad-provisional-v1';

export interface NewConsent {
  subjectEmail: string;
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  leadId?: string;
  candidatureId?: string;
  ipHash?: string;
  userAgent?: string;
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export async function insertConsent(
  db: DbClient,
  consent: NewConsent,
): Promise<{ id: string }> {
  const rows = await db.query<{ id: string }>(
    `insert into consents
       (subject_email, purpose, granted, policy_version, lead_id,
        candidature_id, ip_hash, user_agent)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id`,
    [
      consent.subjectEmail,
      consent.purpose,
      consent.granted,
      consent.policyVersion,
      consent.leadId ?? null,
      consent.candidatureId ?? null,
      consent.ipHash ?? null,
      consent.userAgent ?? null,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error('insert consents returned no row');
  return row;
}
