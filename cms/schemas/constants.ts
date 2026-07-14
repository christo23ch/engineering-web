/**
 * Shared editorial constants. The icon list is imported from the frontend's
 * §7 icon registry — single source of truth: the Studio can only offer icons
 * the design system actually ships, so CMS content can never reference an
 * unknown icon (the loaders would reject it at build time anyway).
 */
import { icons } from '../../src/lib/ui/icons';
import type { SchemaOptionItem } from './define';

export const ICON_OPTIONS: SchemaOptionItem[] = Object.keys(icons).map(
  (name) => ({ title: name, value: name }),
);

/**
 * DA-4 editorial workflow (Bible §49): two-level approval gate.
 * borrador (author) → en_revision (requested) → aprobado (reviewer) →
 * publish (Sanity's own publish, gated on 'aprobado' by the Studio actions).
 */
export const ESTADO_EDITORIAL = {
  borrador: 'borrador',
  enRevision: 'en_revision',
  aprobado: 'aprobado',
} as const;

export type EstadoEditorial =
  (typeof ESTADO_EDITORIAL)[keyof typeof ESTADO_EDITORIAL];

export const ESTADO_EDITORIAL_OPTIONS: SchemaOptionItem[] = [
  { title: 'Borrador', value: ESTADO_EDITORIAL.borrador },
  { title: 'En revisión', value: ESTADO_EDITORIAL.enRevision },
  { title: 'Aprobado', value: ESTADO_EDITORIAL.aprobado },
];

/** Document types subject to the DA-4 editorial workflow. */
export const EDITORIAL_TYPES = [
  'service',
  'caseStudy',
  'article',
  'teamMember',
  'certification',
] as const;
