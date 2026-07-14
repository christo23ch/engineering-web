/**
 * Lead repository (Bible §28 "Lead", ADR-008). Persistence is the durable
 * step of the capture flow — CRM/email delivery happens asynchronously via
 * the outbox written in the same transaction (ADR-010).
 */
import type { DbClient } from '@/server/db/client';

export type LeadKind = 'contact' | 'lead_magnet';

export interface NewLead {
  kind: LeadKind;
  email: string;
  name?: string;
  company?: string;
  serviceSlug?: string;
  resourceSlug?: string;
  message?: string;
  sourceUrl?: string;
  locale?: string;
}

export interface LeadRow {
  id: string;
  kind: LeadKind;
  email: string;
  name: string | null;
  company: string | null;
  service_slug: string | null;
  resource_slug: string | null;
  message: string | null;
  source_url: string | null;
  locale: string;
  created_at: string;
}

export async function insertLead(
  db: DbClient,
  lead: NewLead,
): Promise<{ id: string }> {
  const rows = await db.query<{ id: string }>(
    `insert into leads
       (kind, email, name, company, service_slug, resource_slug, message,
        source_url, locale)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id`,
    [
      lead.kind,
      lead.email,
      lead.name ?? null,
      lead.company ?? null,
      lead.serviceSlug ?? null,
      lead.resourceSlug ?? null,
      lead.message ?? null,
      lead.sourceUrl ?? null,
      lead.locale ?? 'es',
    ],
  );
  const row = rows[0];
  if (!row) throw new Error('insert leads returned no row');
  return row;
}

export async function getLeadById(
  db: DbClient,
  id: string,
): Promise<LeadRow | undefined> {
  const rows = await db.query<LeadRow>('select * from leads where id = $1', [
    id,
  ]);
  return rows[0];
}
