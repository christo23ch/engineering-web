/**
 * CMS publish webhook → SSG rebuild (ADR-001: the canonical revalidation
 * mechanism — pages are static; publishing content triggers a full rebuild
 * through the DA-3 hosting deploy hook. ISR is a provider-dependent
 * OPTIMIZATION on top of this, never a replacement — docs/CMS.md).
 *
 * Flow: verify the Sanity HMAC signature over the RAW body (401 on
 * mismatch; ±5 min replay window) → POST the deploy hook → 202. A failing
 * hook returns 502, which Sanity's webhook delivery retries on its own
 * schedule — no outbox needed for this path.
 */
import type { APIRoute } from 'astro';
import type { EndpointDepsFactory } from '@/server/context';
import { defaultEndpointDeps } from '@/server/context';
import { AppError } from '@/server/http/errors';
import { MAX_BODY_BYTES } from '@/server/http/body';
import { defineEndpoint, methodNotAllowed } from '@/server/http/handler';
import { json } from '@/server/http/respond';
import {
  SANITY_SIGNATURE_HEADER,
  verifySanityWebhookSignature,
} from '@/server/integrations/sanity/webhook';

export function cmsWebhookPost(
  depsFactory: EndpointDepsFactory = defaultEndpointDeps,
): APIRoute {
  return defineEndpoint({
    name: 'cms.webhook',
    handler: async (context, meta) => {
      const deps = depsFactory();
      const secret = deps.config.cmsWebhookSecret;
      if (!secret) throw AppError.notConfigured('cms webhook');
      const deployHookUrl = deps.config.deployHookUrl;
      if (!deployHookUrl) throw AppError.notConfigured('deploy hook');

      // The signature covers the RAW body — read it before any parsing.
      const body = await context.request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
        throw AppError.payloadTooLarge(MAX_BODY_BYTES);
      }

      const check = verifySanityWebhookSignature({
        header: context.request.headers.get(SANITY_SIGNATURE_HEADER),
        body,
        secret,
      });
      if (!check.valid) {
        meta.log.warn('cms webhook rejected', { reason: check.reason });
        throw AppError.unauthorized();
      }

      // Best-effort payload peek for the log line (projection is configured
      // on the Sanity side; only non-PII editorial identifiers).
      let documentType: string | undefined;
      let slug: string | undefined;
      try {
        const parsed = JSON.parse(body) as {
          _type?: string;
          slug?: { current?: string } | string;
        };
        documentType = parsed._type;
        slug =
          typeof parsed.slug === 'string' ? parsed.slug : parsed.slug?.current;
      } catch {
        // Non-JSON payloads still trigger a rebuild — the signature was valid.
      }

      const fetchImpl = deps.fetchImpl ?? fetch;
      let hookResponse: Response;
      try {
        hookResponse = await fetchImpl(deployHookUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(10_000),
        });
      } catch (cause) {
        throw AppError.upstream('deploy hook', cause);
      }
      if (!hookResponse.ok) {
        throw AppError.upstream(
          `deploy hook (HTTP ${String(hookResponse.status)})`,
        );
      }

      meta.log.info('rebuild triggered by cms publish', {
        documentType,
        slug,
      });
      return json(
        202,
        {
          data: { triggered: true, documentType, slug },
          requestId: meta.requestId,
        },
        { 'x-request-id': meta.requestId },
      );
    },
  });
}

export function cmsWebhookMethodNotAllowed(): APIRoute {
  return methodNotAllowed('cms.webhook.method', ['POST']);
}
