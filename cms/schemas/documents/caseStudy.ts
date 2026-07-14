/**
 * Proyecto / caso de éxito (Bible §28) — the portfolio entity. The Bible
 * differentiator is REAL, verifiable data (§1/§3): metrics are capped at the
 * §13.4 "3–4 headline figures" and every free-text block is required, so a
 * case cannot be published half-empty. `client` is optional by design —
 * anonymised cases omit it rather than inventing a name.
 */
import { defineField, defineType } from '../define';
import { ICON_OPTIONS } from '../constants';
import { estadoEditorialField } from '../workflowField';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Caso de éxito',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (ruta /proyectos/…)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Cliente',
      description:
        'Opcional: si el cliente no es publicable, dejar vacío (caso ' +
        'anonimizado) — nunca inventar un nombre.',
      type: 'string',
    }),
    defineField({
      name: 'sector',
      title: 'Sector',
      type: 'reference',
      to: [{ type: 'sector' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Líneas de servicio aplicadas',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'summary',
      title: 'Entradilla (hero)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icono (§7)',
      type: 'string',
      options: { list: ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'metrics',
      title: 'Métricas de cabecera (los datos antes del relato, §13.4)',
      type: 'array',
      of: [{ type: 'caseMetric' }],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(4)
          .error('Entre 1 y 4 métricas verificables (§13.4).'),
    }),
    defineField({
      name: 'challenge',
      title: 'Reto',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'solution',
      title: 'Solución',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'results',
      title: 'Resultados',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      of: [{ type: 'galleryImage' }],
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonio (opcional)',
      type: 'caseTestimonial',
    }),
    estadoEditorialField,
  ],
  preview: {
    select: { title: 'title', subtitle: 'sector.name' },
  },
});
