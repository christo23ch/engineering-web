/**
 * POST /api/ia/consulta — RAG assistant (RF-15, Bible §16, ADR-005).
 * On-demand BFF route; the site stays SSG. Answers 200 with a structured,
 * honest body (answered with citations / refused / fallback). The DA-6
 * budget hard-stop and the no-hallucination guardrails are enforced in the
 * orchestrator. Runbook: docs/AI.md.
 */
import {
  assistantMethodNotAllowed,
  assistantPost,
} from '@/server/endpoints/assistant';

export const prerender = false;

export const POST = assistantPost();
export const ALL = assistantMethodNotAllowed();
