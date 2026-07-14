/**
 * Deploy/ops-time RAG indexing (ADR-005): `npm run rag:index`.
 *
 * Loads content (CMS when configured, honest local fallback otherwise),
 * embeds via Voyage (DA-10) and upserts into pgvector (DA-5). Runs OUTSIDE a
 * request. Requires DATABASE_URL + EMBEDDINGS_API_KEY; it is the one place
 * that legitimately spends embedding tokens, and it is operator-triggered —
 * the DA-6 budget hard-stop guards the live assistant, not this batch job.
 */
import process from 'node:process';
import { loadServerConfig } from '../src/server/config';
import { createPostgresClient } from '../src/server/db/client';
import { PgVectorStore } from '../src/server/rag/vector-store';
import { createVoyageClient } from '../src/server/rag/embeddings/voyage';
import { indexContent } from '../src/server/rag/index-content';
import { cmsDepsFromEnv } from '../src/server/integrations/sanity/content';
import {
  loadServices,
  loadCases,
  loadArticles,
} from '../src/server/integrations/sanity/content';
import { getLogger } from '../src/server/logging/logger';

async function main(): Promise<void> {
  const config = loadServerConfig();
  if (!config.database) {
    console.error('DATABASE_URL is not set (Bible §38).');
    process.exitCode = 1;
    return;
  }
  if (!config.embeddings) {
    console.error('EMBEDDINGS_API_KEY is not set (DA-10).');
    process.exitCode = 1;
    return;
  }

  const cmsDeps = cmsDepsFromEnv();
  const [services, cases, articles] = await Promise.all([
    loadServices(cmsDeps),
    loadCases(cmsDeps),
    loadArticles(cmsDeps),
  ]);

  const db = createPostgresClient(config.database.url, { max: 1 });
  try {
    const stats = await indexContent(
      { services, cases, articles },
      {
        store: new PgVectorStore(db),
        embeddings: createVoyageClient({
          apiKey: config.embeddings.apiKey,
          model: config.embeddings.model,
        }),
        embeddingModel: config.embeddings.model,
        log: getLogger(),
      },
    );
    // ivfflat needs statistics after a load to be used effectively.
    await db.exec('analyze embeddings');
    console.error(
      `indexed: ${String(stats.embedded)} embedded, ${String(
        stats.skipped,
      )} skipped, ${String(stats.pruned)} pruned; version ${stats.indexVersion}`,
    );
  } finally {
    await db.end();
  }
}

await main();
