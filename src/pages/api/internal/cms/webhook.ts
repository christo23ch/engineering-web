/**
 * POST /api/internal/cms/webhook — Sanity publish webhook (ADR-001
 * rebuild-on-webhook). HMAC-verified (CMS_WEBHOOK_SECRET, §38); triggers
 * the DA-3 deploy hook. Configuration runbook: docs/CMS.md.
 */
import {
  cmsWebhookMethodNotAllowed,
  cmsWebhookPost,
} from '@/server/endpoints/cms-webhook';

export const prerender = false;

export const POST = cmsWebhookPost();
export const ALL = cmsWebhookMethodNotAllowed();
