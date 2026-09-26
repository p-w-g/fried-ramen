import { expect, test, type Page } from '@playwright/test';
import { app } from './app';

const LIGHT_BG = 'rgb(245, 245, 241)';
const DARK_BG = 'rgb(17, 21, 19)';

const pageBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('follows the system theme until a theme is chosen', async ({ page }) => {
  const fr = app(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await fr.goto();
  expect(await pageBackground(page)).toBe(DARK_BG);
  await expect(fr.themeToggle()).toHaveAccessibleName('Switch to light theme');

  await page.emulateMedia({ colorScheme: 'light' });
  expect(await pageBackground(page)).toBe(LIGHT_BG);
  await expect(fr.themeToggle()).toHaveAccessibleName('Switch to dark theme');
});

test('a chosen theme outranks the system one and survives a reload', async ({
  page,
}) => {
  const fr = app(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await fr.goto();

  await fr.themeToggle().click();
  expect(await pageBackground(page)).toBe(DARK_BG);
  await expect(
    page.locator('meta[name="theme-color"]').first(),
  ).toHaveAttribute('content', DARK_BG);

  await page.reload();
  expect(await pageBackground(page)).toBe(DARK_BG);

  await page.emulateMedia({ colorScheme: 'dark' });
  await fr.themeToggle().click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await pageBackground(page)).toBe(LIGHT_BG);
});
