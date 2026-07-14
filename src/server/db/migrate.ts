/**
 * Minimal forward-only migration runner (Bible §14). Applies the `.sql` files
 * in ./migrations in lexicographic order, each inside a transaction, and
 * records them in `schema_migrations`. Used by `scripts/migrate.ts` (deploy
 * time — migrations never run inside a request) and by the PGlite integration
 * harness, so tests execute the exact SQL that production applies.
 *
 * NOTE: alias-free imports only (see client.ts).
 */
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { DbClient } from './client';

const DEFAULT_DIR = fileURLToPath(new URL('./migrations/', import.meta.url));

export interface AppliedMigration {
  name: string;
  status: 'applied' | 'skipped';
}

export async function runMigrations(
  db: DbClient,
  migrationsDir: string = DEFAULT_DIR,
): Promise<AppliedMigration[]> {
  await db.exec(
    `create table if not exists schema_migrations (
       name text primary key,
       applied_at timestamptz not null default now()
     )`,
  );

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const results: AppliedMigration[] = [];
  for (const file of files) {
    const done = await db.query<{ name: string }>(
      'select name from schema_migrations where name = $1',
      [file],
    );
    if (done.length > 0) {
      results.push({ name: file, status: 'skipped' });
      continue;
    }
    const script = await readFile(join(migrationsDir, file), 'utf8');
    await db.transaction(async (tx) => {
      await tx.exec(script);
      await tx.query('insert into schema_migrations (name) values ($1)', [
        file,
      ]);
    });
    results.push({ name: file, status: 'applied' });
  }
  return results;
}
