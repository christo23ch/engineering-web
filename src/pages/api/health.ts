/**
 * GET /api/health — BFF liveness + capability states (Bible §34).
 * On-demand route (BFF, §13); everything else on the site stays SSG.
 */
import { healthGet, healthMethodNotAllowed } from '@/server/endpoints/health';

export const prerender = false;

export const GET = healthGet();
export const ALL = healthMethodNotAllowed();
