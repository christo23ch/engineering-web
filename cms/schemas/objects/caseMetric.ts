/**
 * Headline figure of a case study (DESIGN_SYSTEM §13.4: "the data before the
 * narrative"). Mirrors the frontend `CaseMetric` interface field-for-field.
 */
import { defineField, defineType } from '../define';

export const caseMetric = defineType({
  name: 'caseMetric',
  title: 'Métrica de resultado',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Valor',
      description: 'Cifra mostrada en grande, p. ej. «-32», «1,2», «6».',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'unit',
      title: 'Unidad',
      description: 'P. ej. «%», «GWh/año», «meses». Opcional.',
      type: 'string',
    }),
    defineField({
      name: 'label',
      title: 'Qué mide',
      description: 'P. ej. «Ahorro energético».',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'value' },
  },
});
