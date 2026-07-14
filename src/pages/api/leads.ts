/**
 * POST /api/leads — lead capture (RF-06/07 contact form, RF-13 lead magnet).
 * JSON or form-encoded (progressive enhancement for the approved zero-JS
 * forms). Pipeline: honeypot → durable rate limit → validation → one
 * transaction (lead + consent + outbox) → 201 (ADR-008/010).
 */
import { captureMethodNotAllowed, leadsPost } from '@/server/endpoints/capture';

export const prerender = false;

export const POST = leadsPost();
export const ALL = captureMethodNotAllowed('leads');
