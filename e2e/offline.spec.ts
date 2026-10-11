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
  const ramenLoaded = await fr
    .homeLink()
    .locator('img')
    .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(ramenLoaded).toBe(true);
  await fr.addExpense('Tea', 3);
  await fr.expectTotal(8);

  await page.goto('/budgets');
  await expect(fr.budgetRow('Current')).toBeVisible();
});

test('the converter keeps converting offline with the last rate it got', async ({
  page,
  context,
}) => {
  const fr = app(page);
  await fr.goto();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await fr.mockRates({ 'SEK/JPY': 15.8511 });
  await fr.setSwitch('Converter', true);
  await fr.convert('100', 'SEK', 'JPY');
  await expect(fr.conversion()).toHaveText('1,585');

  await context.setOffline(true);
  await page.reload();
  await fr.convert('100', 'SEK', 'JPY');

  await expect(fr.conversion()).toHaveText('1,585');
  await expect(fr.rateDate()).toHaveText('Rate from 2026-10-09');
});
