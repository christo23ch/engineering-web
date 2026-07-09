import { test, expect } from '@playwright/test';

// Anti-regression for the audit P1: the primary Button's label colour must
// actually COMPILE to white on the action fill. Unit tests only asserted the
// class *strings* (`bg-action`, `text-on-action`), which is why a token/utility
// mismatch — a class that silently generates no CSS — slipped through. This
// drives the REAL compiled stylesheet in a browser and checks the COMPUTED
// colours + WCAG 1.4.3 AA contrast, closing that gap end-to-end.

type Rgb = [number, number, number];

function parseRgb(value: string): Rgb {
  const n = value.match(/\d+/g)?.map(Number) ?? [];
  return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0];
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: Rgb): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

test('primary Button label compiles to white on the action fill (WCAG AA)', async ({
  page,
}) => {
  await page.goto('/');

  // Inject the primary Button treatment (DESIGN_SYSTEM §11.1: action fill +
  // on-action foreground). The utilities come from the real global stylesheet,
  // so a missing/mis-named token surfaces as an unstyled (inherited) colour.
  const { color, background } = await page.evaluate(() => {
    const el = document.createElement('button');
    el.className = 'bg-action text-on-action h-11 px-6 text-body';
    el.textContent = 'Solicitar propuesta';
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor };
  });

  const fg = parseRgb(color);
  const bg = parseRgb(background);

  // Colour is actually applied (not inherited): white text on blue-700.
  expect(fg).toEqual([255, 255, 255]);
  expect(bg).toEqual([29, 78, 216]);
  // WCAG 1.4.3 AA for normal text (≥ 4.5:1); this pairing is ~6.3:1.
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
});
