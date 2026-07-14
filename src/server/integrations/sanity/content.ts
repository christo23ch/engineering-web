/**
 * CMS content loaders (DA-7) with the content-honesty fallback: when the CMS
 * capability is not configured, loaders return the local typed sources —
 * `services` (six real service lines) and the intentionally EMPTY `cases` /
 * `articles` (Bible §1/§3: never fabricate content).
 *
 * CMS payloads are zod-validated against the exact frontend interfaces
 * before they reach a template: invalid content fails the (build-time) load
 * loudly instead of publishing broken pages. These loaders are the F2 wiring
 * point for getStaticPaths — the approved templates themselves stay
 * unchanged.
 */
import { z } from 'zod';
import { articles, type Article } from '@/lib/content/articles';
import { cases, type CaseStudy } from '@/lib/content/cases';
import { services, type Service } from '@/lib/content/services';
import { icons, type IconName } from '@/lib/ui/icons';
import type { CmsConfig } from '@/server/config';
import { IntegrationError } from '@/server/http/errors';
import { createSanityClient } from '@/server/integrations/sanity/client';
import {
  ARTICLES_QUERY,
  CASES_QUERY,
  SERVICES_QUERY,
} from '@/server/integrations/sanity/queries';

const iconField = z
  .string()
  .refine((name): name is IconName => name in icons, 'unknown icon name');

const slugField = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const serviceSchema = z.object({
  slug: slugField,
  name: z.string().min(1),
  icon: iconField,
  description: z.string().min(1),
  problem: z.string().min(1),
});

const caseSchema = z.object({
  slug: slugField,
  title: z.string().min(1),
  client: z.string().nullish(),
  sector: z.string().min(1),
  services: z.array(z.string()),
  summary: z.string().min(1),
  icon: iconField,
  metrics: z.array(
    z.object({
      value: z.string(),
      unit: z.string().nullish(),
      label: z.string(),
    }),
  ),
  challenge: z.string(),
  solution: z.string(),
  results: z.string(),
  gallery: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    )
    .nullish(),
  testimonial: z
    .object({
      quote: z.string(),
      author: z.string(),
      role: z.string().nullish(),
    })
    .nullish(),
});

const articleSchema = z.object({
  slug: slugField,
  title: z.string().min(1),
  category: z.string().min(1),
  excerpt: z.string().min(1),
  updated: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    role: z.string().nullish(),
    bio: z.string().nullish(),
  }),
  sections: z.array(
    z.object({ heading: z.string().min(1), body: z.array(z.string()) }),
  ),
});

function validated<Schema extends z.ZodType>(
  schema: Schema,
  entity: string,
  data: unknown,
): z.output<Schema>[] {
  const result = z.array(schema).safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new IntegrationError(
      'sanity',
      `invalid ${entity} content from CMS: ${issues}`,
      { retryable: false },
    );
  }
  return result.data;
}

/** Strip nullish optionals so CMS rows match the exact frontend types. */
function compact<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value != null),
  ) as T;
}

export interface CmsDeps {
  cms?: CmsConfig;
  fetchImpl?: typeof fetch;
}

export async function loadServices(deps: CmsDeps = {}): Promise<Service[]> {
  if (!deps.cms) return services;
  const client = createSanityClient(deps.cms, deps.fetchImpl);
  const rows = await client.fetch<unknown>(SERVICES_QUERY);
  return validated(serviceSchema, 'service', rows).map(
    (row) => compact(row) as Service,
  );
}

export async function loadCases(deps: CmsDeps = {}): Promise<CaseStudy[]> {
  if (!deps.cms) return cases;
  const client = createSanityClient(deps.cms, deps.fetchImpl);
  const rows = await client.fetch<unknown>(CASES_QUERY);
  return validated(caseSchema, 'caseStudy', rows).map((row) => {
    const clean = compact(row);
    return {
      ...clean,
      gallery: (clean.gallery ?? []).map((image) => compact(image)),
      metrics: clean.metrics.map((metric) => compact(metric)),
      testimonial: clean.testimonial ? compact(clean.testimonial) : undefined,
    } as CaseStudy;
  });
}

export async function loadArticles(deps: CmsDeps = {}): Promise<Article[]> {
  if (!deps.cms) return articles;
  const client = createSanityClient(deps.cms, deps.fetchImpl);
  const rows = await client.fetch<unknown>(ARTICLES_QUERY);
  return validated(articleSchema, 'article', rows).map((row) => {
    const clean = compact(row);
    return { ...clean, author: compact(clean.author) } as Article;
  });
}
