import { expect, test, type Page } from '@playwright/test';
import { app } from './app';

/**
 * Builds the database a phone has from before postings: Dexie version 1,
 * which IndexedDB stores as version 10. Done on a page without the app,
 * so the app first meets it the way an installed copy would.
 */
async function createVersion1Database(page: Page) {
  await page.goto('/robots.txt');
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('fried-ramen', 10);
        request.onupgradeneeded = () => {
          const idb = request.result;
          const budgets = idb.createObjectStore('budgets', {
            keyPath: 'id',
            autoIncrement: true,
          });
          budgets.createIndex('slug', 'slug', { unique: true });
          const categories = idb.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
          categories.createIndex('budgetId', 'budgetId');
          categories.createIndex('[budgetId+name]', ['budgetId', 'name'], {
            unique: true,
          });
          const expenses = idb.createObjectStore('expenses', {
            keyPath: 'id',
            autoIncrement: true,
          });
          expenses.createIndex('budgetId', 'budgetId');
          const meta = idb.createObjectStore('meta', { keyPath: 'key' });

          budgets.add({ name: 'Current', slug: 'current' });
          categories.add({ budgetId: 1, name: 'food' });
          expenses.add({
            budgetId: 1,
            name: 'Ramen',
            amountCents: 1450,
            description: '',
            category: 'food',
          });
          expenses.add({
            budgetId: 1,
            name: 'Train',
            amountCents: 3200,
            description: '',
            category: null,
          });
          meta.add({ key: 'firstStartDone', value: 0 });
        };
        request.onsuccess = () => {
          request.result.close();
          resolve();
        };
        request.onerror = () =>
          reject(request.error ?? new Error('Could not open IndexedDB'));
      }),
  );
}

test('a phone from before charts keeps its expenses and starts its trends at their total', async ({
  page,
}) => {
  const fr = app(page);
  await page.clock.setFixedTime(new Date('2026-10-01T12:00'));
  await createVersion1Database(page);

  await page.goto('/budgets/current');

  await fr.expectTotal(46.5);
  await fr.openTrends();
  await expect(fr.trendReadout()).toContainText('46.50');
  await expect(page.getByRole('row', { name: /^Sep 30 / })).toContainText(
    '0.00',
  );
});
