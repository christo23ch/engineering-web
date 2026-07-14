/**
 * Candidature repository (Bible §28 "Candidatura", RF-14). Separate from
 * leads on purpose: recruitment data has its own GDPR purpose and is never
 * delivered to the CRM — only the internal notification email (ADR-008).
 */
import type { DbClient } from '@/server/db/client';

export interface NewCandidature {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  sourceUrl?: string;
}

export interface CandidatureRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source_url: string | null;
  created_at: string;
}

export async function insertCandidature(
  db: DbClient,
  candidature: NewCandidature,
): Promise<{ id: string }> {
  const rows = await db.query<{ id: string }>(
    `insert into candidatures (name, email, phone, message, source_url)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [
      candidature.name,
      candidature.email,
      candidature.phone ?? null,
      candidature.message ?? null,
      candidature.sourceUrl ?? null,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error('insert candidatures returned no row');
  return row;
}

export async function getCandidatureById(
  db: DbClient,
  id: string,
): Promise<CandidatureRow | undefined> {
  const rows = await db.query<CandidatureRow>(
    'select * from candidatures where id = $1',
    [id],
  );
  return rows[0];
}
