import { describe, expect, it } from 'vitest';
import { formatAmount, parseAmount } from './domain';

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
