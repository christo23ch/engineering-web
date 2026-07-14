/**
 * IA assistant endpoint (RF-15, Bible §16). Pipeline, cheap checks first:
 *   IA rate limit (§16/§17) → validate question → honeypot → orchestrator.
 *
 * Always answers 200 with a structured, honest body ({ outcome, respuesta,
 * citas, enlaces }): `answered` (with mandatory citations), `refused`
 * (on-domain, no answer) or `fallback` (unavailable — not configured, budget
 * blocked, upstream/guardrail). The widget is a progressive enhancement and
 * degrades gracefully, so an unavailable assistant is a 200 fallback, not an
 * error — but validation is still 400 and abuse is still 429.
 */
import type { APIContext, APIRoute } from 'astro';
import type { EndpointDepsFactory } from '@/server/context';
import { defaultEndpointDeps } from '@/server/context';
import { readBody } from '@/server/http/body';
import { defineEndpoint, methodNotAllowed } from '@/server/http/handler';
import { ok } from '@/server/http/respond';
import { clientBucket, enforceRateLimit } from '@/server/rate-limit/limiter';
import { isHoneypotTripped } from '@/server/validation/common';
import { parseAssistantQuery } from '@/server/validation/assistant';
import { answerQuestion, type AssistantResult } from '@/server/ai/assistant';
import { FALLBACK_MESSAGE, HELP_LINKS } from '@/server/ai/fallback';
import { createClaudeClient } from '@/server/ai/claude';
import { createVoyageClient } from '@/server/rag/embeddings/voyage';
import { PgVectorStore } from '@/server/rag/vector-store';

function safeClientAddress(context: APIContext): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}

function respond(result: AssistantResult, requestId: string): Response {
  return ok(
    {
      outcome: result.outcome,
      respuesta: result.message,
      citas: result.citations,
      // The UI shows next steps whenever the assistant can't answer directly.
      enlaces: result.outcome === 'answered' ? [] : HELP_LINKS,
      cacheHit: result.cacheHit,
    },
    requestId,
  );
}

export function assistantPost(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return defineEndpoint({
    name: 'ia.consulta',
    handler: async (context, meta) => {
      const deps = depsFactory();

      // Fail-soft on capability: without the full RAG stack, degrade to the
      // honest fallback (200) rather than a 503 — the widget stays usable.
      const { ai, embeddings, database } = deps.config;
      if (!ai || !embeddings || !database) {
        meta.log.info('ia assistant unavailable — capability missing', {
          ai: Boolean(ai),
          embeddings: Boolean(embeddings),
          database: Boolean(database),
        });
        return respond(
          {
            outcome: 'fallback',
            message: FALLBACK_MESSAGE,
            citations: [],
            cacheHit: false,
          },
          meta.requestId,
        );
      }

      const body = await readBody(context.request);

      await enforceRateLimit(deps.db(), {
        bucket: clientBucket('ai', context.request, safeClientAddress(context)),
        windowSeconds: deps.config.aiRateLimit.windowSeconds,
        max: deps.config.aiRateLimit.max,
        log: meta.log,
      });

      if (isHoneypotTripped(body)) {
        meta.log.warn('ia honeypot tripped — fallback');
        return respond(
          {
            outcome: 'fallback',
            message: FALLBACK_MESSAGE,
            citations: [],
            cacheHit: false,
          },
          meta.requestId,
        );
      }

      const { pregunta } = parseAssistantQuery(body);
      const db = deps.db();
      const result = await answerQuestion(pregunta, {
        db,
        ai,
        embeddingsConfig: embeddings,
        store: new PgVectorStore(db),
        embeddings: createVoyageClient({
          apiKey: embeddings.apiKey,
          model: embeddings.model,
          fetchImpl: deps.fetchImpl,
        }),
        claude: createClaudeClient({
          apiKey: ai.apiKey,
          fetchImpl: deps.fetchImpl,
        }),
        log: meta.log,
        requestId: meta.requestId,
      });
      return respond(result, meta.requestId);
    },
  });
}

export function assistantMethodNotAllowed(): APIRoute {
  return methodNotAllowed('ia.consulta.method', ['POST']);
}
