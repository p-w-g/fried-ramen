import { describe, expect, it } from 'vitest';
import { parseAmount } from './domain';

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
