/**
 * Internal outbox drain endpoint (ADR-010). Invoked on a schedule (Vercel
 * cron per DA-3 — vercel.json; any scheduler that can send the Bearer works,
 * keeping the BFF host-agnostic). Auth: OUTBOX_WORKER_SECRET (§38) compared
 * in constant time. Accepts GET and POST — Vercel crons issue GET.
 */
import { timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import type { EndpointDepsFactory } from '@/server/context';
import { defaultEndpointDeps } from '@/server/context';
import { AppError } from '@/server/http/errors';
import { defineEndpoint } from '@/server/http/handler';
import { ok } from '@/server/http/respond';
import { buildOutboxHandlers } from '@/server/outbox/handlers';
import { outboxCounts } from '@/server/outbox/repository';
import { processOutbox } from '@/server/outbox/worker';

function secretsMatch(presented: string, expected: string): boolean {
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function outboxProcess(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return defineEndpoint({
    name: 'outbox.process',
    handler: async (context, meta) => {
      const deps = depsFactory();
      const secret = deps.config.outboxWorkerSecret;
      if (!secret) throw AppError.notConfigured('outbox worker');

      const authorization = context.request.headers.get('authorization') ?? '';
      const presented = authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : '';
      if (!presented || !secretsMatch(presented, secret)) {
        throw AppError.unauthorized();
      }

      const db = deps.db();
      const summary = await processOutbox(
        db,
        buildOutboxHandlers({
          config: deps.config,
          fetchImpl: deps.fetchImpl,
        }),
        { log: meta.log },
      );
      const counts = await outboxCounts(db);
      return ok({ ...summary, counts }, meta.requestId);
    },
  });
}
