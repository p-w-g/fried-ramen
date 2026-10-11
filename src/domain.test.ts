import { describe, expect, it } from 'vitest';
import {
  convertCents,
  formatAmount,
  formatCompactAmount,
  formatBareMoney,
  formatMoney,
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

describe('formatBareMoney', () => {
  it.each([
    [475_533_000, 'JPY', '4 755 330'],
    [631, 'SEK', '6.31'],
    [30_000_000, 'SEK', '300 000'],
    [450, 'SEK', '4.50'],
    [123_456_789, 'EUR', '1 234 567.89'],
    [-325, 'USD', '-3.25'],
  ] as const)('shows %d hundredths of %s as %s', (cents, currency, shown) => {
    expect(formatBareMoney(cents, currency)).toBe(shown);
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
