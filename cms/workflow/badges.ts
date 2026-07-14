/**
 * DA-4 workflow badges (Studio runtime): the editorial state is always
 * visible on the document header, so reviewers can tell at a glance what is
 * waiting for them (paired with the desk's "Pendientes de revisión" queue).
 */
import type { DocumentBadgeComponent, DocumentBadgesContext } from 'sanity';
import { EDITORIAL_TYPES, ESTADO_EDITORIAL } from '../schemas/constants';

interface EditorialShape {
  estadoEditorial?: string;
}

const BADGES: Record<string, { label: string; color?: 'warning' | 'success' }> =
  {
    [ESTADO_EDITORIAL.borrador]: { label: 'Borrador' },
    [ESTADO_EDITORIAL.enRevision]: { label: 'En revisión', color: 'warning' },
    [ESTADO_EDITORIAL.aprobado]: { label: 'Aprobado', color: 'success' },
  };

export const estadoEditorialBadge: DocumentBadgeComponent = (props) => {
  const doc = (props.draft ?? props.published) as EditorialShape | null;
  const estado = doc?.estadoEditorial ?? ESTADO_EDITORIAL.borrador;
  return BADGES[estado] ?? null;
};

export function buildDocumentBadges(
  prev: DocumentBadgeComponent[],
  context: DocumentBadgesContext,
): DocumentBadgeComponent[] {
  if (!(EDITORIAL_TYPES as readonly string[]).includes(context.schemaType)) {
    return prev;
  }
  return [...prev, estadoEditorialBadge];
}
