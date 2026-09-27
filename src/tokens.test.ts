import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(import.meta.dirname, 'assets/main.css'), 'utf8');
const html = readFileSync(join(import.meta.dirname, '../index.html'), 'utf8');

/** Reads `--name: light-dark(#light, #dark)` straight from main.css. */
function token(name: string, theme: 'light' | 'dark') {
  const found = new RegExp(
    `--${name}:\\s*light-dark\\((?<light>#[0-9a-f]{6}),\\s*(?<dark>#[0-9a-f]{6})\\)`,
    'i',
  ).exec(css)?.groups?.[theme];
  if (!found) throw new Error(`--${name} is not a light-dark() hex pair`);
  return found;
}

/** WCAG 2 relative luminance. */
function luminance(hex: string) {
  const linear = (at: number) => {
    const value = parseInt(hex.slice(at, at + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(1) + 0.7152 * linear(3) + 0.0722 * linear(5);
}

function contrast(a: string, b: string) {
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Text needs 4.5:1 (WCAG 1.4.3), control edges 3:1 (WCAG 1.4.11). */
const pairs: [foreground: string, background: string, floor: number][] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'accent-soft', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['accent', 'surface', 4.5],
  ['accent', 'bg', 4.5],
  ['on-accent', 'accent', 4.5],
  ['danger', 'surface', 4.5],
  ['on-danger', 'danger', 4.5],
  ['control-border', 'surface', 3],
  ['control-border', 'bg', 3],
];

describe.each(['light', 'dark'] as const)('%s theme', (theme) => {
  test.each(pairs)('%s on %s reaches %s:1', (foreground, background, floor) => {
    const ratio = contrast(token(foreground, theme), token(background, theme));
    expect(ratio).toBeGreaterThanOrEqual(floor);
  });
});

/** Browser bars paint before any CSS or script, from these static tags. */
test.each(['light', 'dark'] as const)(
  'the %s theme-color in index.html matches --bg',
  (theme) => {
    const meta = new RegExp(
      `content="(#[0-9a-f]{6})"\\s+media="\\(prefers-color-scheme: ${theme}\\)"`,
      'i',
    ).exec(html);
    expect(meta?.[1]).toBe(token('bg', theme));
  },
);

/*
 * Chart slices sit next to each other, so neighbours must stay apart for
 * colour-blind readers too. Maths and thresholds follow the dataviz
 * palette validator: Delta E is distance in OKLab ×100, with colour
 * blindness simulated by Machado, Oliveira & Fernandes (2009) at full
 * severity; the thresholds are calibrated to that model.
 */
const CVD_TARGET = 8;
const NORMAL_VISION_FLOOR = 15;
const CHROMA_FLOOR = 0.1;
const LIGHTNESS_BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] } as const;

type Rgb = [number, number, number];
type Matrix = [Rgb, Rgb, Rgb];

const SIMULATIONS: Record<'protan' | 'deutan', Matrix> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

function linearRgb(hex: string): Rgb {
  const channel = (at: number) => {
    const value = parseInt(hex.slice(at, at + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5)];
}

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

const transform = (matrix: Matrix, [r, g, b]: Rgb): Rgb =>
  matrix.map((row) => clampUnit(row[0] * r + row[1] * g + row[2] * b)) as Rgb;

function oklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function deltaE(a: string, b: string, vision?: keyof typeof SIMULATIONS) {
  const seen = (hex: string) =>
    oklab(
      vision ? transform(SIMULATIONS[vision], linearRgb(hex)) : linearRgb(hex),
    );
  const [la, aa, ba] = seen(a);
  const [lb, ab, bb] = seen(b);
  return 100 * Math.hypot(la - lb, aa - ab, ba - bb);
}

const SERIES = ['series-1', 'series-2', 'series-3', 'series-4', 'series-5'];
/** Round the ring: each slice, Other after the last, and the seam back to the first. */
const RING = [...SERIES, 'series-other', 'series-1'];
const neighbours = RING.slice(1).map((name, index) => [RING[index]!, name]);

describe.each(['light', 'dark'] as const)('%s chart slices', (theme) => {
  test.each(neighbours)(
    '%s and %s stay apart for colour-blind readers',
    (a, b) => {
      const worst = Math.min(
        deltaE(token(a, theme), token(b, theme), 'protan'),
        deltaE(token(a, theme), token(b, theme), 'deutan'),
      );
      expect(worst).toBeGreaterThanOrEqual(CVD_TARGET);
    },
  );

  test.each(neighbours)('%s and %s stay apart for everyone', (a, b) => {
    expect(deltaE(token(a, theme), token(b, theme))).toBeGreaterThanOrEqual(
      NORMAL_VISION_FLOOR,
    );
  });

  test.each([...SERIES, 'series-other'])(
    '%s sits in the lightness band, so no slice shouts',
    (name) => {
      const [lightness] = oklab(linearRgb(token(name, theme)));
      const [low, high] = LIGHTNESS_BAND[theme];
      expect(lightness).toBeGreaterThanOrEqual(low);
      expect(lightness).toBeLessThanOrEqual(high);
    },
  );

  test.each(SERIES)('%s is a colour, not a gray', (name) => {
    const [, a, b] = oklab(linearRgb(token(name, theme)));
    expect(Math.hypot(a, b)).toBeGreaterThanOrEqual(CHROMA_FLOOR);
  });
});
