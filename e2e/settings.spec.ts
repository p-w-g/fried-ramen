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

test('with currency mode off, nothing ever asks the rates API', async ({
  page,
}) => {
  const fr = app(page);
  const asked = await fr.mockRates({ 'SEK/EUR': 0.0893 });

  await fr.addExpense('Coffee', 5);
  await fr.openTrends();
  await fr.goToBudgets();
  await page.goto('/convert');
  await fr.goToSettings();

  expect(asked).toEqual([]);
});

test('backups are made and restored from settings', async ({ page }) => {
  const fr = app(page);
  await fr.goToBudgets();
  await expect(page.getByRole('button', { name: 'Export backup' })).toHaveCount(
    0,
  );

  await fr.goToSettings();

  await expect(
    page.getByRole('button', { name: 'Export backup' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Import backup' }),
  ).toBeVisible();
});
