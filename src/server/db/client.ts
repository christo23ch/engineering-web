/**
 * Database access (Bible §14 data layer, §49 DA-5: Supabase Postgres, EU).
 *
 * `DbClient` is a deliberately tiny seam: parameterized text queries + one
 * transaction primitive + `exec` for DDL scripts. Repositories depend only on
 * this interface, so the production driver (postgres.js against the Supabase
 * transaction pooler) and the test harness (PGlite — real Postgres SQL,
 * in-process) are interchangeable, and integration tests exercise the exact
 * SQL that runs in production.
 *
 * NOTE: this module must stay free of `@/` path aliases — it is imported by
 * `scripts/migrate.ts`, which runs outside the bundler.
 */
import postgres from 'postgres';

export interface DbClient {
  /** Parameterized query ($1, $2… placeholders) returning plain rows. */
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
  /** Multi-statement script execution (migrations/DDL — no parameters). */
  exec(text: string): Promise<void>;
  /** Run `fn` atomically; any throw rolls the transaction back. */
  transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T>;
  end(): Promise<void>;
}

export interface PostgresClientOptions {
  /**
   * Small pool: each serverless instance holds few connections; concurrency
   * is absorbed by the Supabase transaction pooler (DA-5 requirement).
   */
  max?: number;
}

type Queryable = postgres.Sql | postgres.TransactionSql;

function wrap(
  sql: Queryable,
  root: postgres.Sql,
  inTransaction = false,
): DbClient {
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      const rows = await sql.unsafe(text, params as never[]);
      return rows as unknown as T[];
    },
    async exec(text: string): Promise<void> {
      await sql.unsafe(text);
    },
    async transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
      // Flatten nesting: inside a transaction the work is already atomic, so
      // reuse the current one (repositories never rely on partial rollback).
      if (inTransaction) return fn(wrap(sql, root, true));
      const result = await root.begin((tx) => fn(wrap(tx, root, true)));
      return result as T;
    },
    async end(): Promise<void> {
      await root.end({ timeout: 5 });
    },
  };
}

export function createPostgresClient(
  url: string,
  options: PostgresClientOptions = {},
): DbClient {
  const sql = postgres(url, {
    max: options.max ?? 5,
    // Transaction-mode poolers (Supabase pgbouncer) do not support prepared
    // statements — mandatory for the DA-5 serverless setup.
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => undefined,
  });
  return wrap(sql, sql);
}
