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
  | 'x-circle';

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
};
