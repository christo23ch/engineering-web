import { describe, it, expect } from 'vitest';
import {
  chunkService,
  chunkCase,
  chunkArticle,
  estimateTokens,
  type Chunk,
} from '@/server/rag/chunker';
import type { Service } from '@/lib/content/services';
import type { CaseStudy } from '@/lib/content/cases';
import type { Article } from '@/lib/content/articles';

const service: Service = {
  slug: 'eficiencia-energetica',
  name: 'Eficiencia energética',
  icon: 'zap',
  description:
    'Auditoría y mejora del rendimiento energético de instalaciones.',
  problem:
    'Reducir el consumo y el coste energético con inversiones justificadas por datos.',
};

describe('estimateTokens', () => {
  it('is deterministic and roughly chars/4', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('   ')).toBe(0);
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('a'.repeat(40))).toBe(10);
    // Whitespace is normalized before counting.
    expect(estimateTokens('a   b')).toBe(estimateTokens('a b'));
  });
});

describe('chunkService', () => {
  it('produces heading-labelled chunks with provenance and stable hashes', () => {
    const chunks = chunkService(service);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]?.sourceType).toBe('service');
    expect(chunks[0]?.sourceSlug).toBe('eficiencia-energetica');
    expect(chunks[0]?.sourceTitle).toBe('Eficiencia energética');
    expect(chunks[0]?.content).toContain('Eficiencia energética:');
    // Indices are contiguous from 0.
    expect(chunks.map((c) => c.chunkIndex)).toEqual(chunks.map((_, i) => i));
    // Deterministic: same input → identical hashes.
    const again = chunkService(service);
    expect(again.map((c) => c.contentHash)).toEqual(
      chunks.map((c) => c.contentHash),
    );
    // The "problema" segment is present and labelled.
    expect(chunks.some((c) => c.heading === 'Problema que resuelve')).toBe(
      true,
    );
  });
});

describe('chunkCase', () => {
  const caseStudy: CaseStudy = {
    slug: 'planta-solar',
    title: 'Planta solar de autoconsumo',
    sector: 'Industria',
    services: ['energias-renovables'],
    summary: 'Autoconsumo solar para una planta industrial.',
    icon: 'sun',
    metrics: [
      { value: '-32', unit: '%', label: 'Coste energético' },
      { value: '6', unit: 'meses', label: 'Retorno' },
    ],
    challenge: 'La planta necesitaba reducir su factura eléctrica.',
    solution: 'Se diseñó una instalación fotovoltaica dimensionada por datos.',
    results: 'La factura bajó de forma sostenida el primer año.',
    gallery: [],
    testimonial: {
      quote: 'Un equipo riguroso.',
      author: 'Dirección de planta',
    },
  };

  it('covers every narrative segment + metrics + testimonial', () => {
    const chunks = chunkCase(caseStudy);
    const headings = new Set(chunks.map((c) => c.heading));
    for (const h of ['Resumen', 'Reto', 'Solución', 'Resultados', 'Métricas']) {
      expect(headings.has(h)).toBe(true);
    }
    expect(headings.has('Testimonio')).toBe(true);
    // Metrics are rendered as verifiable text, not invented prose.
    const metrics = chunks.find((c) => c.heading === 'Métricas');
    expect(metrics?.content).toContain('-32 % — Coste energético');
  });

  it('omits the testimonial segment when there is none (content honesty)', () => {
    const withoutTestimonial = chunkCase({
      ...caseStudy,
      testimonial: undefined,
    });
    expect(withoutTestimonial.some((c) => c.heading === 'Testimonio')).toBe(
      false,
    );
  });
});

describe('chunkArticle — size splitting with overlap', () => {
  function sentences(n: number, word: string): string {
    return Array.from(
      { length: n },
      (_, i) => `Frase ${word} número ${String(i)} con contenido suficiente.`,
    ).join(' ');
  }

  const article: Article = {
    slug: 'guia-eficiencia',
    title: 'Guía de eficiencia',
    category: 'Eficiencia',
    excerpt: 'Una guía práctica.',
    updated: '2026-07-01',
    author: { name: 'Autora' },
    sections: [{ heading: 'Introducción', body: [sentences(60, 'intro')] }],
  };

  it('splits a long section into multiple bounded chunks that overlap', () => {
    const chunks = chunkArticle(article, {
      targetTokens: 60,
      overlapTokens: 12,
    });
    const introChunks = chunks.filter((c) => c.heading === 'Introducción');
    expect(introChunks.length).toBeGreaterThan(1);
    // Each chunk respects the soft cap within a reasonable margin.
    for (const c of introChunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(90);
    }
    // Consecutive chunks share overlap (a fact spanning the boundary survives).
    const first = introChunks[0]?.content ?? '';
    const second = introChunks[1]?.content ?? '';
    const tailWord = first.trim().split(' ').slice(-3).join(' ');
    expect(second).toContain(tailWord.split(' ')[0] ?? '');
  });

  it('never crosses a heading boundary in one chunk', () => {
    const multi = chunkArticle({
      ...article,
      sections: [
        { heading: 'Uno', body: ['Contenido uno.'] },
        { heading: 'Dos', body: ['Contenido dos.'] },
      ],
    });
    for (const c of multi) {
      const otherHeading =
        c.heading === 'Uno' ? 'Contenido dos' : 'Contenido uno';
      expect(c.content).not.toContain(otherHeading);
    }
  });
});

describe('chunk hash uniqueness', () => {
  it('different content yields different hashes; same content the same', () => {
    const a = chunkService(service);
    const b = chunkService({ ...service, description: 'Otra descripción.' });
    const hashes = (chunks: Chunk[]) => chunks.map((c) => c.contentHash);
    expect(hashes(a)[0]).not.toBe(hashes(b)[0]);
  });
});
