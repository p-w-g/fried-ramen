import { describe, expect, it } from 'vitest';
import {
  caretAfterTyped,
  convertCents,
  formatAmount,
  formatCompactAmount,
  formatMoney,
  groupThousands,
  parseAmount,
  type Rate,
} from './domain';

describe('parseAmount', () => {
  it.each([
    ['4.5', 4.5],
    ['4,5', 4.5],
    [' 12,25 ', 12.25],
    ['-3', -3],
    ['.5', 0.5],
    ['7.', 7],
    ['', 0],
  ])('reads %j as %d', (typed, amount) => {
    expect(parseAmount(typed)).toBe(amount);
  });

  it.each(['abc', '1e5', '0x10', '1.234', '1,2,3', '.', '-', ','])(
    'refuses %j',
    (typed) => {
      expect(parseAmount(typed)).toBeNull();
    },
  );
});

describe('formatAmount', () => {
  it.each([
    [500, '5.00'],
    [30, '0.30'],
    [123450, '1,234.50'],
    [-325, '-3.25'],
  ])('shows %d cents as %s', (cents, shown) => {
    expect(formatAmount(cents)).toBe(shown);
  });
});

describe('formatMoney', () => {
  it.each([
    [158_511, 'JPY', '¥1,585'],
    [10_000, 'SEK', 'SEK\u00a0100.00'],
    [-325, 'EUR', '-€3.25'],
  ] as const)('shows %d hundredths of %s as %s', (cents, currency, shown) => {
    expect(formatMoney(cents, currency)).toBe(shown);
  });
});

describe('formatCompactAmount', () => {
  it.each([
    [999_999, '9,999.99'],
    [1_000_000, '10K'],
    [13_240_000, '132K'],
    [18_000_000, '180K'],
    [824_000_000, '8.24M'],
    [-1_234_500, '-12.3K'],
  ])('shows %d cents as %s', (cents, shown) => {
    expect(formatCompactAmount(cents)).toBe(shown);
  });
});

describe('convertCents', () => {
  const rate = (value: number): Rate => ({
    base: 'SEK',
    quote: 'JPY',
    rate: value,
    date: '2026-10-09',
    fetchedOn: '2026-10-10',
  });

  it.each([
    [10_000, 15.8511, 158_511],
    [333, 15.8511, 5_278],
    [-500, 0.0631, -32],
  ])('turns %d hundredths at %d into %d', (cents, value, converted) => {
    expect(convertCents(cents, rate(value))).toBe(converted);
  });
});

describe('groupThousands', () => {
  it.each([
    ['300000', '300 000'],
    ['1234567,5', '1 234 567,5'],
    ['1234.56', '1 234.56'],
    ['-12345', '-12 345'],
    ['300 0000', '3 000 000'],
    ['999', '999'],
    ['', ''],
    ['abc', 'abc'],
  ])('groups %j as %j', (typed, grouped) => {
    expect(groupThousands(typed)).toBe(grouped);
  });

  it('keeps the amount the same, only easier to read', () => {
    expect(parseAmount(groupThousands('1234567,5').replaceAll(' ', ''))).toBe(
      1234567.5,
    );
  });
});

describe('caretAfterTyped', () => {
  it.each([
    // "30000|0" typed one more 0 at the end: after all six digits.
    ['300 000', 6, 7],
    // "1|2345" became "12 345": still after the first digit.
    ['12 345', 1, 1],
    // After "123" of "1 234 567", the caret skips no space it should not.
    ['1 234 567', 3, 4],
    ['', 0, 0],
  ])('in %j after %d typed characters sits at %d', (grouped, typed, at) => {
    expect(caretAfterTyped(grouped, typed)).toBe(at);
  });
});
