import { expect, test } from '@playwright/test';
import { app } from './app';

test('keeps working offline once the service worker is installed', async ({
  page,
  context,
}) => {
  const fr = app(page);
  await fr.goto();
  const workerUrl = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL;
  });
  expect(new URL(workerUrl!).pathname).toBe('/service-worker.js');

  await fr.addExpense('Coffee', 5);
  await fr.expectTotal(5);
  await context.setOffline(true);
  await page.reload();

  await fr.expectTotal(5);
  await fr.addExpense('Tea', 3);
  await fr.expectTotal(8);
});
