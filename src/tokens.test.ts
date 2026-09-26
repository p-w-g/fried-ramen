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
