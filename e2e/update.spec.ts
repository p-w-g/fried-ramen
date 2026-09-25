import { expect, test, type Page } from '@playwright/test';
import { app } from './app';

/** Publishes a new service worker, offers it, accepts it, waits for reload. */
async function acceptNextRelease(page: Page) {
  await page.request.post('/__e2e/release');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });

  const prompt = page.getByRole('status').filter({ hasText: 'New noodles' });
  await expect(prompt).toBeVisible();

  const reloaded = page.waitForEvent('load');
  await prompt.getByRole('button', { name: 'Reload' }).click();
  await reloaded;

  await expect(prompt).toBeHidden();
  expect(
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return {
        controlled: navigator.serviceWorker.controller !== null,
        waiting: registration.waiting !== null,
      };
    }),
  ).toEqual({ controlled: true, waiting: false });
}

test('an app opened earlier takes a new release when accepted', async ({
  page,
}) => {
  await app(page).goto();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  expect(
    await page.evaluate(() => navigator.serviceWorker.controller !== null),
  ).toBe(true);

  await acceptNextRelease(page);
});

test('a first visit takes a release published during it', async ({ page }) => {
  await app(page).goto();
  await page.evaluate(() => navigator.serviceWorker.ready);

  await acceptNextRelease(page);
});
