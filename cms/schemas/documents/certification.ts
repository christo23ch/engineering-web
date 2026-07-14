/**
 * Certificación (Bible §28) — company accreditations (§13.5). BLOCKING
 * honesty rule: H6 (ISO 9001/14001/45001) is an UNVALIDATED hypothesis that
 * blocks launch — only certifications with a verifiable document may be
 * loaded here; the site renders nothing otherwise.
 */
import { defineField, defineType } from '../define';
import { estadoEditorialField } from '../workflowField';

export const certification = defineType({
  name: 'certification',
  title: 'Certificación',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre (p. ej. norma y alcance)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'issuer',
      title: 'Entidad certificadora',
      type: 'string',
    }),
    defineField({
      name: 'validUntil',
      title: 'Válida hasta',
      description:
        'Fecha de caducidad del certificado. Verificar antes de publicar ' +
        '(H6 — hipótesis bloqueante, requiere documento acreditativo).',
      type: 'date',
    }),
    defineField({
      name: 'logo',
      title: 'Sello / logotipo',
      type: 'image',
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
    estadoEditorialField,
  ],
  preview: {
    select: { title: 'name', subtitle: 'issuer' },
  },
});
