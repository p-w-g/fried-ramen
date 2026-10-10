import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getRate } from './rates';

const fetchMock = vi.fn<typeof fetch>();

const published = (date: string, rate: number) =>
  new Response(JSON.stringify({ date, base: 'SEK', quote: 'JPY', rate }));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const saturday = new Date('2026-10-10T09:00');
const sameSaturdayLater = new Date('2026-10-10T22:00');
const sunday = new Date('2026-10-11T09:00');

it('fetches the pair and saves it with the day it was fetched', async () => {
  fetchMock.mockResolvedValueOnce(published('2026-10-09', 15.85));

  const rate = await getRate('SEK', 'JPY', saturday);

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.frankfurter.dev/v2/rate/SEK/JPY',
  );
  expect(rate).toEqual({
    base: 'SEK',
    quote: 'JPY',
    rate: 15.85,
    date: '2026-10-09',
    fetchedOn: '2026-10-10',
  });
});

it('asks once a day, even when the rate itself is from a weekday before', async () => {
  fetchMock.mockResolvedValueOnce(published('2026-10-09', 15.85));
  await getRate('SEK', 'JPY', saturday);

  const again = await getRate('SEK', 'JPY', sameSaturdayLater);

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(again?.rate).toBe(15.85);
});

it('asks again on the next day', async () => {
  fetchMock.mockResolvedValueOnce(published('2026-10-09', 15.85));
  await getRate('SEK', 'JPY', saturday);
  fetchMock.mockResolvedValueOnce(published('2026-10-09', 15.85));

  const next = await getRate('SEK', 'JPY', sunday);

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(next?.fetchedOn).toBe('2026-10-11');
});

it.each([
  ['offline', () => Promise.reject(new TypeError('Failed to fetch'))],
  ['an error status', () => Promise.resolve(new Response('', { status: 503 }))],
  ['an unexpected body', () => Promise.resolve(new Response('{"oops":1}'))],
])('keeps the saved rate when the API answers %s', async (_, answer) => {
  fetchMock.mockResolvedValueOnce(published('2026-10-09', 15.85));
  await getRate('SEK', 'JPY', saturday);
  fetchMock.mockImplementationOnce(answer);

  const fallback = await getRate('SEK', 'JPY', sunday);

  expect(fallback).toMatchObject({ rate: 15.85, fetchedOn: '2026-10-10' });
});

it('has no rate offline when none was ever saved', async () => {
  fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

  expect(await getRate('SEK', 'JPY', saturday)).toBeNull();
});

it('converts a currency to itself without asking anyone', async () => {
  const rate = await getRate('SEK', 'SEK', saturday);

  expect(rate?.rate).toBe(1);
  expect(fetchMock).not.toHaveBeenCalled();
});
