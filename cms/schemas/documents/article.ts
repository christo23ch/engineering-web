/**
 * Artículo/Recurso (Bible §28) — editorial content for /recursos (§13.6,
 * RF-12). Field-for-field with the frontend `Article` interface: sections of
 * heading + plain-text paragraphs (the ToC derives its anchors from the
 * headings), a visible `updated` date stamp, and a real named author —
 * thought leadership is signed (Bible §3), never anonymous filler.
 */
import { defineField, defineType } from '../define';
import { estadoEditorialField } from '../workflowField';

export const article = defineType({
  name: 'article',
  title: 'Artículo / Recurso',
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
      title: 'Slug (ruta /recursos/…)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extracto (listado + SEO)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'updated',
      title: 'Fecha de publicación/actualización',
      description: 'Sello visible en el artículo (frescura editorial).',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autor/a',
      type: 'object',
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'name',
          title: 'Nombre',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({ name: 'role', title: 'Cargo', type: 'string' }),
        defineField({
          name: 'bio',
          title: 'Bio breve',
          type: 'text',
          rows: 2,
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Secciones',
      type: 'array',
      of: [{ type: 'articleSection' }],
      validation: (rule) => rule.required().min(1),
    }),
    estadoEditorialField,
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
});
