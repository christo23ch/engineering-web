/**
 * Client testimonial for a case study (§13.4). Optional on purpose — a case
 * without a publishable quote simply omits the block ("omite sin hueco
 * vacío"), never invents one (Bible §1/§3).
 */
import { defineField, defineType } from '../define';

export const caseTestimonial = defineType({
  name: 'caseTestimonial',
  title: 'Testimonio',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Cita',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autor/a',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Cargo',
      type: 'string',
    }),
  ],
});
