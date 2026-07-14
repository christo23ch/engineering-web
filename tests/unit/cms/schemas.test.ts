import { describe, it, expect } from 'vitest';
import { schemaTypes } from '../../../cms/schemas';
import type {
  FieldDef,
  SchemaRule,
  TypeDef,
  ValidationFn,
} from '../../../cms/schemas/define';
import {
  EDITORIAL_TYPES,
  ESTADO_EDITORIAL,
  ICON_OPTIONS,
} from '../../../cms/schemas/constants';
import { icons } from '@/lib/ui/icons';
import {
  ARTICLES_QUERY,
  CASES_QUERY,
  SERVICES_QUERY,
} from '@/server/integrations/sanity/queries';

/**
 * Contract tests: the Studio schemas (cms/) must stay field-for-field with
 * the GROQ projections and zod loaders (src/server/integrations/sanity/) —
 * this suite is the tripwire that breaks when either side drifts.
 */

function typeByName(name: string): TypeDef {
  const found = schemaTypes.find((t) => t.name === name);
  if (!found) throw new Error(`schema type ${name} not found`);
  return found;
}

function fieldOf(type: TypeDef, name: string): FieldDef {
  const found = type.fields?.find((f) => f.name === name);
  if (!found) throw new Error(`${type.name}.${name} not found`);
  return found;
}

/** Chainable recorder standing in for Sanity's Rule. */
function recordRule(validation?: ValidationFn): string[] {
  const calls: string[] = [];
  const rule: SchemaRule = {
    required: () => (calls.push('required'), rule),
    min: (n) => (calls.push(`min:${String(n)}`), rule),
    max: (n) => (calls.push(`max:${String(n)}`), rule),
    integer: () => (calls.push('integer'), rule),
    error: () => (calls.push('error'), rule),
    warning: () => (calls.push('warning'), rule),
  };
  validation?.(rule);
  return calls;
}

const isRequired = (field: FieldDef) =>
  recordRule(field.validation).includes('required');

describe('studio schema registry (§28 entities)', () => {
  it('registers the six documents and four objects with the GROQ _type names', () => {
    const documents = schemaTypes
      .filter((t) => t.type === 'document')
      .map((t) => t.name)
      .sort();
    expect(documents).toEqual([
      'article',
      'caseStudy',
      'certification',
      'sector',
      'service',
      'teamMember',
    ]);
    const objects = schemaTypes
      .filter((t) => t.type !== 'document')
      .map((t) => t.name)
      .sort();
    expect(objects).toEqual([
      'articleSection',
      'caseMetric',
      'caseTestimonial',
      'galleryImage',
    ]);
  });

  it('every editorial document carries the DA-4 estadoEditorial field', () => {
    for (const name of EDITORIAL_TYPES) {
      const field = fieldOf(typeByName(name), 'estadoEditorial');
      expect(field.initialValue).toBe(ESTADO_EDITORIAL.borrador);
      expect(field.readOnly).toBe(true);
      const values = field.options?.list?.map((o) => o.value);
      expect(values).toEqual(['borrador', 'en_revision', 'aprobado']);
    }
  });

  it('icon fields offer exactly the §7 design-system icon set', () => {
    expect(ICON_OPTIONS.map((o) => o.value).sort()).toEqual(
      Object.keys(icons).sort(),
    );
    for (const name of ['service', 'caseStudy']) {
      const field = fieldOf(typeByName(name), 'icon');
      expect(field.options?.list).toEqual(ICON_OPTIONS);
      expect(isRequired(field)).toBe(true);
    }
  });
});

describe('service schema ⇄ SERVICES_QUERY contract', () => {
  const service = typeByName('service');

  it('has every projected field, required, with route-safe slugs', () => {
    for (const name of ['name', 'description', 'problem', 'order']) {
      expect(isRequired(fieldOf(service, name))).toBe(true);
    }
    const slug = fieldOf(service, 'slug');
    expect(slug.type).toBe('slug');
    expect(slug.options?.maxLength).toBe(96);
    expect(isRequired(slug)).toBe(true);
    // The query orders by the schema's own order field.
    expect(SERVICES_QUERY).toContain('order(order asc)');
    expect(SERVICES_QUERY).toContain('"slug": slug.current');
  });

  it('caps the Home-card description length', () => {
    expect(recordRule(fieldOf(service, 'description').validation)).toContain(
      'max:160',
    );
  });
});

describe('caseStudy schema ⇄ CASES_QUERY contract', () => {
  const caseStudy = typeByName('caseStudy');

  it('models sector and services as references and the query dereferences them', () => {
    const sector = fieldOf(caseStudy, 'sector');
    expect(sector.type).toBe('reference');
    expect(sector.to).toEqual([{ type: 'sector' }]);
    const services = fieldOf(caseStudy, 'services');
    expect(services.type).toBe('array');
    expect(services.of).toEqual([
      { type: 'reference', to: [{ type: 'service' }] },
    ]);
    expect(CASES_QUERY).toContain('"sector": sector->name');
    expect(CASES_QUERY).toContain('"services": services[]->slug.current');
  });

  it('client stays optional (anonymised cases) and narrative blocks are required', () => {
    expect(isRequired(fieldOf(caseStudy, 'client'))).toBe(false);
    for (const name of ['summary', 'challenge', 'solution', 'results']) {
      expect(isRequired(fieldOf(caseStudy, name))).toBe(true);
    }
  });

  it('enforces the §13.4 metric budget (1–4 headline figures)', () => {
    const calls = recordRule(fieldOf(caseStudy, 'metrics').validation);
    expect(calls).toContain('required');
    expect(calls).toContain('min:1');
    expect(calls).toContain('max:4');
  });

  it('gallery images demand alt text (WCAG §20)', () => {
    const gallery = fieldOf(caseStudy, 'gallery');
    expect(gallery.of).toEqual([{ type: 'galleryImage' }]);
    const galleryImage = typeByName('galleryImage');
    expect(galleryImage.type).toBe('image');
    expect(isRequired(fieldOf(galleryImage, 'alt'))).toBe(true);
    // The query pulls dimensions from asset metadata (CLS < 0.1).
    expect(CASES_QUERY).toContain('asset->metadata.dimensions.width');
  });
});

describe('article schema ⇄ ARTICLES_QUERY contract', () => {
  const article = typeByName('article');

  it('has the projected fields with a signed author and dated stamp', () => {
    for (const name of ['title', 'category', 'excerpt', 'updated']) {
      expect(isRequired(fieldOf(article, name))).toBe(true);
    }
    expect(fieldOf(article, 'updated').type).toBe('date');
    const author = fieldOf(article, 'author');
    expect(author.type).toBe('object');
    expect(isRequired(author)).toBe(true);
    const authorName = author.fields?.find((f) => f.name === 'name');
    expect(authorName && isRequired(authorName)).toBe(true);
    expect(ARTICLES_QUERY).toContain('author { name, role, bio }');
  });

  it('sections are heading + plain-text paragraphs (ToC contract)', () => {
    const sections = fieldOf(article, 'sections');
    expect(sections.of).toEqual([{ type: 'articleSection' }]);
    const section = typeByName('articleSection');
    expect(isRequired(fieldOf(section, 'heading'))).toBe(true);
    const body = fieldOf(section, 'body');
    expect(body.type).toBe('array');
    expect(body.of?.[0]?.type).toBe('text');
    expect(ARTICLES_QUERY).toContain('sections[] { heading, body }');
  });
});
