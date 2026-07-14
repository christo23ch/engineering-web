/**
 * Miembro del equipo (Bible §28) — feeds the About/team credibility section
 * (§13.5) once real bios land (F2; currently a deferred-honest section).
 * Photo alt is mandatory (WCAG §20).
 */
import { defineField, defineType } from '../define';
import { estadoEditorialField } from '../workflowField';

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Miembro del equipo',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Cargo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio breve',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photo',
      title: 'Fotografía',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          validation: (rule) =>
            rule
              .required()
              .error('El texto alternativo es obligatorio (WCAG).'),
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Orden de presentación',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
    estadoEditorialField,
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
  },
});
