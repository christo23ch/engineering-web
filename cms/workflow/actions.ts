/**
 * DA-4 editorial workflow — document actions (Studio runtime; imports the
 * real `sanity` package, so this module is excluded from the root
 * typecheck/tests and verified inside the cms workspace).
 *
 * Transitions: borrador → «Solicitar revisión» → en_revision → «Aprobar»
 * (reviewer roles only) → aprobado → Publish (Sanity's own action, DISABLED
 * until aprobado). Role model (docs/CMS.md): administrator/editor = level-2
 * reviewers; the custom `redactor` role authors drafts and requests review
 * but never sees Publish. Sanity enforces real permissions server-side; this
 * layer makes the workflow visible and un-bypassable in the UI.
 */
import { useDocumentOperation } from 'sanity';
import type { DocumentActionComponent, DocumentActionsContext } from 'sanity';
import { EDITORIAL_TYPES, ESTADO_EDITORIAL } from '../schemas/constants';

interface EditorialShape {
  estadoEditorial?: string;
}

function estadoOf(props: { draft?: unknown; published?: unknown }): string {
  const doc = (props.draft ?? props.published) as EditorialShape | null;
  return doc?.estadoEditorial ?? ESTADO_EDITORIAL.borrador;
}

export const solicitarRevisionAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  return {
    label: 'Solicitar revisión',
    disabled: estadoOf(props) !== ESTADO_EDITORIAL.borrador,
    onHandle: () => {
      patch.execute(
        [{ set: { estadoEditorial: ESTADO_EDITORIAL.enRevision } }],
        props.published ?? undefined,
      );
      props.onComplete();
    },
  };
};

export const aprobarAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  return {
    label: 'Aprobar (nivel 2)',
    disabled: estadoOf(props) !== ESTADO_EDITORIAL.enRevision,
    onHandle: () => {
      patch.execute(
        [{ set: { estadoEditorial: ESTADO_EDITORIAL.aprobado } }],
        props.published ?? undefined,
      );
      props.onComplete();
    },
  };
};

/** Wrap Sanity's publish action: disabled until the DA-4 gate says aprobado. */
function gatePublish(
  original: DocumentActionComponent,
): DocumentActionComponent {
  const gated: DocumentActionComponent = (props) => {
    const description = original(props);
    if (!description) return description;
    if (estadoOf(props) !== ESTADO_EDITORIAL.aprobado) {
      return {
        ...description,
        disabled: true,
        title:
          'Bloqueado por el flujo editorial (DA-4): requiere estado «Aprobado».',
      };
    }
    return description;
  };
  gated.action = original.action;
  return gated;
}

const REVIEWER_ROLES = new Set(['administrator', 'editor']);

export function buildDocumentActions(
  prev: DocumentActionComponent[],
  context: DocumentActionsContext,
): DocumentActionComponent[] {
  if (!(EDITORIAL_TYPES as readonly string[]).includes(context.schemaType)) {
    return prev;
  }
  const roles = context.currentUser?.roles.map((role) => role.name) ?? [];
  const isReviewer = roles.some((role) => REVIEWER_ROLES.has(role));

  const gated = prev.map((action) =>
    action.action === 'publish' ? gatePublish(action) : action,
  );
  // Authors (redactor) never see Publish; reviewers get the approve action.
  const visible = isReviewer
    ? gated
    : gated.filter((action) => action.action !== 'publish');

  return [
    ...visible,
    solicitarRevisionAction,
    ...(isReviewer ? [aprobarAction] : []),
  ];
}
