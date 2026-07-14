import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { TestDb } from './helpers/db';
import { createTestDb } from './helpers/db';
import { runMigrations } from '@/server/db/migrate';
import { insertLead, getLeadById } from '@/server/db/repositories/leads';
import {
  insertCandidature,
  getCandidatureById,
} from '@/server/db/repositories/candidatures';
import {
  insertConsent,
  hashIp,
  PRIVACY_POLICY_VERSION,
} from '@/server/db/repositories/consents';

let harness: TestDb;

beforeAll(async () => {
  harness = await createTestDb();
});

afterAll(async () => {
  await harness.close();
});

describe('migrations (real SQL on PGlite)', () => {
  it('are idempotent — a second run skips everything', async () => {
    const second = await runMigrations(harness.db);
    expect(second.every((m) => m.status === 'skipped')).toBe(true);
  });

  it('created the five F1 tables and no embeddings table (F2 scope)', async () => {
    const rows = await harness.db.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public' order by table_name`,
    );
    const names = rows.map((r) => r.table_name);
    expect(names).toContain('leads');
    expect(names).toContain('candidatures');
    expect(names).toContain('consents');
    expect(names).toContain('outbox_events');
    expect(names).toContain('rate_limits');
    expect(names).not.toContain('embeddings');
  });
});

describe('lead + consent (ADR-008, Bible §21/§28)', () => {
  it('persists a contact lead with defaults', async () => {
    const { id } = await insertLead(harness.db, {
      kind: 'contact',
      email: 'lead@example.com',
      name: 'Nombre Apellido',
      company: 'ACME',
      serviceSlug: 'eficiencia-energetica',
      message: 'Proyecto de auditoría energética.',
    });
    const row = await getLeadById(harness.db, id);
    expect(row?.kind).toBe('contact');
    expect(row?.locale).toBe('es');
    expect(row?.resource_slug).toBeNull();
    expect(row?.created_at).toBeTruthy();
  });

  it('rejects an unknown lead kind (CHECK constraint)', async () => {
    await expect(
      insertLead(harness.db, {
        kind: 'newsletter' as never,
        email: 'x@example.com',
      }),
    ).rejects.toThrowError();
  });

  it('writes lead + consent atomically and rolls back together', async () => {
    const before = await harness.db.query<{ n: string }>(
      'select count(*)::text as n from leads',
    );
    await expect(
      harness.db.transaction(async (tx) => {
        await insertLead(tx, { kind: 'contact', email: 'tx@example.com' });
        // Consent violating the XOR constraint aborts the whole transaction.
        await insertConsent(tx, {
          subjectEmail: 'tx@example.com',
          purpose: 'contact',
          granted: true,
          policyVersion: PRIVACY_POLICY_VERSION,
        });
      }),
    ).rejects.toThrowError();
    const after = await harness.db.query<{ n: string }>(
      'select count(*)::text as n from leads',
    );
    expect(after[0]?.n).toBe(before[0]?.n);
  });

  it('stores a valid consent tied to its lead, with pseudonymized IP', async () => {
    const { id: leadId } = await insertLead(harness.db, {
      kind: 'lead_magnet',
      email: 'magnet@example.com',
      resourceSlug: 'guia-eficiencia',
    });
    const ipHash = hashIp('203.0.113.7');
    const { id: consentId } = await insertConsent(harness.db, {
      subjectEmail: 'magnet@example.com',
      purpose: 'lead_magnet',
      granted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      leadId,
      ipHash,
      userAgent: 'test-agent',
    });
    const rows = await harness.db.query<{
      lead_id: string;
      ip_hash: string;
      policy_version: string;
    }>('select lead_id, ip_hash, policy_version from consents where id = $1', [
      consentId,
    ]);
    expect(rows[0]?.lead_id).toBe(leadId);
    expect(rows[0]?.ip_hash).toBe(ipHash);
    expect(rows[0]?.ip_hash).not.toContain('203.0.113.7');
    expect(rows[0]?.policy_version).toBe(PRIVACY_POLICY_VERSION);
  });

  it('cascades consent deletion with its lead (GDPR erasure)', async () => {
    const { id: leadId } = await insertLead(harness.db, {
      kind: 'contact',
      email: 'erase@example.com',
    });
    await insertConsent(harness.db, {
      subjectEmail: 'erase@example.com',
      purpose: 'contact',
      granted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      leadId,
    });
    await harness.db.query('delete from leads where id = $1', [leadId]);
    const orphans = await harness.db.query(
      'select id from consents where lead_id = $1',
      [leadId],
    );
    expect(orphans).toHaveLength(0);
  });
});

describe('candidature (RF-14 — separate GDPR purpose)', () => {
  it('persists and reads back a candidature', async () => {
    const { id } = await insertCandidature(harness.db, {
      name: 'Persona Candidata',
      email: 'cv@example.com',
      message: 'Candidatura espontánea.',
    });
    const row = await getCandidatureById(harness.db, id);
    expect(row?.email).toBe('cv@example.com');
    expect(row?.phone).toBeNull();
  });

  it('accepts a recruitment consent tied to a candidature', async () => {
    const { id: candidatureId } = await insertCandidature(harness.db, {
      name: 'Persona Candidata',
      email: 'cv2@example.com',
    });
    const { id } = await insertConsent(harness.db, {
      subjectEmail: 'cv2@example.com',
      purpose: 'recruitment',
      granted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      candidatureId,
    });
    expect(id).toBeTruthy();
  });
});

describe('ip pseudonymization', () => {
  it('is deterministic, fixed-length and non-reversible-looking', () => {
    expect(hashIp('203.0.113.7')).toBe(hashIp('203.0.113.7'));
    expect(hashIp('203.0.113.7')).toHaveLength(32);
    expect(hashIp('203.0.113.7')).not.toBe(hashIp('203.0.113.8'));
    expect(hashIp('203.0.113.7')).toMatch(/^[0-9a-f]{32}$/);
  });
});
