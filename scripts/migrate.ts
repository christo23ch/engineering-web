/**
 * Deploy-time migration runner (Bible §14): `npm run db:migrate`.
 * Migrations run from CI/CD or an operator shell — never inside a request.
 * Reads DATABASE_URL (§38) directly; the import chain (db/client, db/migrate)
 * is deliberately alias-free so this file runs via tsx outside the bundler.
 */
import process from 'node:process';
import { createPostgresClient } from '../src/server/db/client';
import { runMigrations } from '../src/server/db/migrate';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('DATABASE_URL is not set (see .env.example / Bible §38).');
    process.exitCode = 1;
    return;
  }
  const db = createPostgresClient(url, { max: 1 });
  try {
    const results = await runMigrations(db);
    for (const result of results) {
      console.error(`${result.status.padEnd(7)} ${result.name}`);
    }
    const applied = results.filter((r) => r.status === 'applied').length;
    console.error(`done: ${String(applied)} applied.`);
  } finally {
    await db.end();
  }
}

await main();
