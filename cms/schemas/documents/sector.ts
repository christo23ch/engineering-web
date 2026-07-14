/**
 * Sector (Bible §28) — market-segment taxonomy referenced by case studies.
 * Kept as its own document (not a free string) so the portfolio filter bar
 * (RF-03, F2) filters on a controlled vocabulary.
 */
import { defineField, defineType } from '../define';

export const sector = defineType({
  name: 'sector',
  title: 'Sector',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
