import { afterEach, expect, it, vi } from 'vitest';
import Dexie from 'dexie';
import { db } from './db';

afterEach(() => {
  vi.useRealTimers();
});

it('upgrades a database from before postings, opening its history with every amount', async () => {
  db.close();
  await Dexie.delete('fried-ramen');
  const v1 = new Dexie('fried-ramen');
  v1.version(1).stores({
    budgets: '++id, &slug',
    categories: '++id, budgetId, &[budgetId+name]',
    expenses: '++id, budgetId',
    meta: 'key',
  });
  await v1.table('expenses').bulkAdd([
    { budgetId: 1, name: 'Tea', amountCents: 300, category: null },
    { budgetId: 1, name: 'Nothing yet', amountCents: 0, category: null },
    { budgetId: 2, name: 'Miso', amountCents: 250, category: 'soup' },
  ]);
  v1.close();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-01T09:00'));

  await db.open();

  expect(await db.expenses.count()).toBe(3);
  expect(await db.postings.toArray()).toMatchObject([
    { budgetId: 1, day: '2026-10-01', category: null, deltaCents: 300 },
    { budgetId: 2, day: '2026-10-01', category: 'soup', deltaCents: 250 },
  ]);
});
