/**
 * POST /api/candidatures — spontaneous candidature (RF-14, §13.7).
 * Recruitment purpose: persists candidature + consent and notifies the
 * internal inbox only — never the CRM (Bible §21).
 */
import {
  candidaturesPost,
  captureMethodNotAllowed,
} from '@/server/endpoints/capture';

export const prerender = false;

export const POST = candidaturesPost();
export const ALL = captureMethodNotAllowed('candidatures');
