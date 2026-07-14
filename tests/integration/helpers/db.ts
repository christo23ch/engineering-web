/**
 * Integration-test database harness: PGlite (real Postgres, in-process, WASM)
 * behind the same `DbClient` seam the production postgres.js driver
 * implements. Migrations from src/server/db/migrations run verbatim, so these
 * tests exercise the exact SQL, constraints and state machine that Supabase
 * (DA-5) runs in production.
 */
import { PGlite, type Transaction } from '@electric-sql/pglite';
import type { DbClient } from '@/server/db/client';
import { runMigrations } from '@/server/db/migrate';

type PgliteQueryable = Pick<PGlite, 'query' | 'exec'> | Transaction;

function wrap(queryable: PgliteQueryable, root: PGlite): DbClient {
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      const result = await queryable.query<T>(text, params);
      return result.rows;
    },
    async exec(text: string): Promise<void> {
      await queryable.exec(text);
    },
    async transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
      const result = await root.transaction((tx) => fn(wrap(tx, root)));
      return result as T;
    },
    async end(): Promise<void> {
      await root.close();
    },
  };
}

export interface TestDb {
  db: DbClient;
  close(): Promise<void>;
}

/** Fresh in-memory database with all migrations applied. */
export async function createTestDb(): Promise<TestDb> {
  const pg = new PGlite();
  const db = wrap(pg, pg);
  await runMigrations(db);
  return { db, close: () => pg.close() };
}
