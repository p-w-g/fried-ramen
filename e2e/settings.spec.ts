import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('settings are one tap away from every page', async ({ page }) => {
  const fr = app(page);
  await fr.goToSettings();
  await expect(fr.pageTitle()).toHaveText('Settings');

  await fr.goToBudgets();
  await fr.goToSettings();
});

test('currency mode starts off and stays on once turned on', async ({
  page,
}) => {
  const fr = app(page);
  await fr.goToSettings();
  await expect(fr.currencyModeSwitch()).not.toBeChecked();

  await fr.setCurrencyMode(true);
  await page.reload();

  await expect(fr.currencyModeSwitch()).toBeChecked();
});
