import { db } from './db';
import { toDay, type Currency, type Rate } from './domain';

const RATE_API = 'https://api.frankfurter.dev/v2/rate';

type PublishedRate = { date: string; rate: number };

const isPublishedRate = (body: unknown): body is PublishedRate =>
  typeof body === 'object' &&
  body !== null &&
  'date' in body &&
  typeof body.date === 'string' &&
  'rate' in body &&
  typeof body.rate === 'number';

async function fetchPublished(base: Currency, quote: Currency) {
  try {
    const response = await fetch(`${RATE_API}/${base}/${quote}`);
    const body: unknown = response.ok ? await response.json() : null;
    return isPublishedRate(body) ? body : null;
  } catch {
    return null; // offline, or the API is down: the caller falls back
  }
}

/**
 * Asks the API at most once per local day per pair, and otherwise answers
 * from the saved rate. When the API cannot answer, the last saved rate
 * stands in, however old; null only when there has never been one.
 */
export async function getRate(
  base: Currency,
  quote: Currency,
  now = new Date(),
): Promise<Rate | null> {
  const today = toDay(now);
  if (base === quote) {
    return { base, quote, rate: 1, date: today, fetchedOn: today };
  }

  const saved = await db.rates.get([base, quote]);
  if (saved?.fetchedOn === today) return saved;

  const published = await fetchPublished(base, quote);
  if (!published) return saved ?? null;
  const fresh: Rate = {
    base,
    quote,
    rate: published.rate,
    date: published.date,
    fetchedOn: today,
  };
  await db.rates.put(fresh);
  return fresh;
}
