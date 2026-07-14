/**
 * GET|POST /api/internal/outbox/process — scheduled outbox drain (ADR-010).
 * Bearer-authenticated with OUTBOX_WORKER_SECRET (§38); scheduled by Vercel
 * cron (DA-3, vercel.json) or any scheduler that can send the header.
 */
import { outboxProcess } from '@/server/endpoints/outbox';

export const prerender = false;

const route = outboxProcess();
export const GET = route;
export const POST = route;
