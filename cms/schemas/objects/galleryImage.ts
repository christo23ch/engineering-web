/**
 * Gallery image with MANDATORY alt text (WCAG 2.2 AA, Bible §20 — the axe CI
 * blocker fails builds on missing alt, so the Studio enforces it at the
 * source). Width/height come from the asset metadata via GROQ (CLS < 0.1).
 */
import { defineField, defineType } from '../define';

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Imagen de galería',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description:
        'Obligatorio (WCAG 2.2 AA). Describe la imagen para quien no la ve.',
      type: 'string',
      validation: (rule) =>
        rule.required().error('El texto alternativo es obligatorio (WCAG).'),
    }),
  ],
});
