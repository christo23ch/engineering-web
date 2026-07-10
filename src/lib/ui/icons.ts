/**
 * Icon registry — geometry authored in-house on a 24×24 grid to satisfy the
 * DESIGN_SYSTEM §7 visual contract (linear, 24 grid, 1.75 stroke, rounded,
 * currentColor). NOTE: §7 names "Lucide" specifically and discards a bespoke
 * set; this iteration forbids new dependencies and copying external code, so we
 * implement the §7 contract with our own simple primitives. Divergence from the
 * literal "Lucide" decision is flagged for DS reconciliation (governance).
 *
 * Each icon is a list of SVG child nodes (no set:html; rendered as real
 * elements). Outline nodes inherit the <svg> stroke=currentColor/fill=none;
 * solid dots opt out via fill/stroke overrides.
 */
export type IconName =
  | 'spinner'
  | 'chevron-down'
  | 'x'
  | 'alert-triangle'
  | 'info'
  | 'check-circle'
  | 'x-circle'
  // Service-line glyphs (DESIGN_SYSTEM §7 metaphors ↔ Bible §24 taxonomy) +
  | 'factory'
  | 'zap'
  | 'sun'
  | 'layers'
  | 'clipboard-check'
  | 'box'
  // …and a directional affordance for "Ver servicio" links.
  | 'arrow-right'
  // Chat glyph for the IA assistant trigger (§11.7) + search (§13.10).
  | 'message'
  | 'search';

export type IconNode =
  | { tag: 'path'; d: string; fill?: string; stroke?: string }
  | {
      tag: 'circle';
      cx: string;
      cy: string;
      r: string;
      fill?: string;
      stroke?: string;
      opacity?: string;
    };

export const icons: Record<IconName, IconNode[]> = {
  // Loader: faint track + solid arc (animated by the consumer via animate-spin).
  spinner: [
    { tag: 'circle', cx: '12', cy: '12', r: '9', opacity: '0.25' },
    { tag: 'path', d: 'M12 3a9 9 0 0 1 9 9' },
  ],
  'chevron-down': [{ tag: 'path', d: 'm5 9 7 7 7-7' }],
  x: [{ tag: 'path', d: 'M6 6 18 18M18 6 6 18' }],
  'alert-triangle': [
    { tag: 'path', d: 'M12 4 21 19H3L12 4Z' },
    { tag: 'path', d: 'M12 10v4' },
    {
      tag: 'circle',
      cx: '12',
      cy: '17',
      r: '0.9',
      fill: 'currentColor',
      stroke: 'none',
    },
  ],
  info: [
    { tag: 'circle', cx: '12', cy: '12', r: '9' },
    { tag: 'path', d: 'M12 11v5' },
    {
      tag: 'circle',
      cx: '12',
      cy: '8',
      r: '0.9',
      fill: 'currentColor',
      stroke: 'none',
    },
  ],
  'check-circle': [
    { tag: 'circle', cx: '12', cy: '12', r: '9' },
    { tag: 'path', d: 'm8 12 3 3 5-6' },
  ],
  'x-circle': [
    { tag: 'circle', cx: '12', cy: '12', r: '9' },
    { tag: 'path', d: 'm9 9 6 6M15 9l-6 6' },
  ],
  // industria → nave con dientes de sierra + chimenea.
  factory: [
    { tag: 'path', d: 'M3 21h18' },
    { tag: 'path', d: 'M4 21V11l5 3v-3l5 3V8l4 2v11' },
    { tag: 'path', d: 'M9 21v-3h3v3' },
  ],
  // energía / eficiencia → rayo.
  zap: [{ tag: 'path', d: 'M13 2 5 13h5l-1 9 8-11h-5l1-9Z' }],
  // renovables → sol con rayos.
  sun: [
    { tag: 'circle', cx: '12', cy: '12', r: '4' },
    {
      tag: 'path',
      d: 'M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2',
    },
  ],
  // MEP / instalaciones → capas.
  layers: [
    { tag: 'path', d: 'M12 3 3 8l9 5 9-5-9-5Z' },
    { tag: 'path', d: 'm3 12 9 5 9-5' },
    { tag: 'path', d: 'm3 16 9 5 9-5' },
  ],
  // consultoría → portapapeles con check.
  'clipboard-check': [
    {
      tag: 'path',
      d: 'M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2',
    },
    { tag: 'path', d: 'M9 3h6v3H9Z' },
    { tag: 'path', d: 'm9 14 2 2 4-4' },
  ],
  // BIM / digitalización → cubo isométrico.
  box: [
    { tag: 'path', d: 'M12 2 21 7v10l-9 5-9-5V7l9-5Z' },
    { tag: 'path', d: 'm3 7 9 5 9-5' },
    { tag: 'path', d: 'M12 12v10' },
  ],
  'arrow-right': [{ tag: 'path', d: 'M5 12h14M13 6l6 6-6 6' }],
  // chat → burbuja con cola.
  message: [{ tag: 'path', d: 'M4 5h16v12H9l-4 4v-4H4V5Z' }],
  // búsqueda → lupa.
  search: [
    { tag: 'circle', cx: '11', cy: '11', r: '7' },
    { tag: 'path', d: 'm20 20-3.5-3.5' },
  ],
};
