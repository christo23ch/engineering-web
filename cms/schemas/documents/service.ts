/**
 * Servicio (Bible §28) — one of the six service lines. Field-for-field with
 * the frontend `Service` interface and the SERVICES_QUERY projection.
 * Slugs are routes (§24): changing one changes a URL — hence the warning.
 */
import { defineField, defineType } from '../define';
import { ICON_OPTIONS } from '../constants';
import { estadoEditorialField } from '../workflowField';

export const service = defineType({
  name: 'service',
  title: 'Servicio',
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
      title: 'Slug (ruta /servicios/…)',
      description:
        'Define la URL pública (§24). Cambiarlo rompe enlaces: coordinar ' +
        'redirecciones antes de tocarlo.',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icono (§7 del design system)',
      type: 'string',
      options: { list: ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción (tarjeta de la Home)',
      description: 'Una línea. Sin cifras no verificables.',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'problem',
      title: 'Problema del cliente (hero §13.2)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden de presentación',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    estadoEditorialField,
  ],
  preview: {
    select: { title: 'name', subtitle: 'slug.current' },
  },
});
