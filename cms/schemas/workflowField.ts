/**
 * `estadoEditorial` — the DA-4 approval-gate state carried by every
 * editorial document. The Studio's document actions move it
 * borrador → en_revision → aprobado, and the publish action is disabled
 * until 'aprobado' (see ../workflow/actions.ts). The field itself is
 * read-only in the form: state changes go through the actions so the
 * transition rules cannot be bypassed by editing.
 */
import { defineField, type FieldDef } from './define';
import { ESTADO_EDITORIAL, ESTADO_EDITORIAL_OPTIONS } from './constants';

export const estadoEditorialField: FieldDef = defineField({
  name: 'estadoEditorial',
  title: 'Estado editorial',
  description:
    'Flujo de aprobación en dos niveles (DA-4). Se cambia con las acciones ' +
    'del documento, no editando este campo.',
  type: 'string',
  options: { list: ESTADO_EDITORIAL_OPTIONS, layout: 'radio' },
  initialValue: ESTADO_EDITORIAL.borrador,
  readOnly: true,
  validation: (rule) => rule.required(),
});
