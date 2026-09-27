import { expect, it } from 'vitest';
import Dexie from 'dexie';
import { db } from './db';

it('upgrades a database from before postings without losing expenses', async () => {
  db.close();
  await Dexie.delete('fried-ramen');
  const v1 = new Dexie('fried-ramen');
  v1.version(1).stores({
    budgets: '++id, &slug',
    categories: '++id, budgetId, &[budgetId+name]',
    expenses: '++id, budgetId',
    meta: 'key',
  });
  await v1
    .table('expenses')
    .add({ budgetId: 1, name: 'Tea', amountCents: 300 });
  v1.close();

  await db.open();

  expect(await db.expenses.toArray()).toMatchObject([{ name: 'Tea' }]);
  expect(await db.postings.count()).toBe(0);
});
