/**
 * Article section (§13.6): heading + plain-text paragraphs. Deliberately NOT
 * Portable Text for the MVP — the approved article template renders
 * headings + paragraphs (ToC anchors derive from headings), and plain text
 * keeps the contract identical to the frontend `ArticleSection` interface.
 * Rich text is an F3 evolution (requires a template iteration first).
 */
import { defineField, defineType } from '../define';

export const articleSection = defineType({
  name: 'articleSection',
  title: 'Sección de artículo',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Encabezado',
      description: 'Genera el ancla del índice de contenidos (ToC).',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Párrafos',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'heading' },
  },
});
