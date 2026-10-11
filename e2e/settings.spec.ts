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

test('each currency switch starts off and stays on once turned on', async ({
  page,
}) => {
  const fr = app(page);
  await fr.goToSettings();
  await expect(fr.settingSwitch('Converter')).not.toBeChecked();
  await expect(fr.settingSwitch('Budget currencies')).not.toBeChecked();

  await fr.setSwitch('Converter', true);
  await fr.setSwitch('Budget currencies', true);
  await page.reload();

  await expect(fr.settingSwitch('Converter')).toBeChecked();
  await expect(fr.settingSwitch('Budget currencies')).toBeChecked();
});

test('the converter alone brings no budget currencies', async ({ page }) => {
  const fr = app(page);
  await fr.setSwitch('Converter', true);

  await fr.goToBudgets();

  await expect(fr.converterLink()).toBeVisible();
  await expect(page.getByLabel('Currency')).toHaveCount(0);
  await fr.openBudget('Current');
  await expect(page.getByLabel('Currency')).toHaveCount(0);
});

test('budget currencies alone bring no converter', async ({ page }) => {
  const fr = app(page);
  await fr.setSwitch('Budget currencies', true);

  await fr.goToBudgets();

  await expect(page.getByLabel('Currency')).toBeVisible();
  await expect(fr.converterLink()).toHaveCount(0);
  await page.goto('/convert');
  await expect(page).toHaveURL(/\/budgets$/);
});

test('with every currency switch off, nothing ever asks the rates API', async ({
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

test('the gear closes settings again, back where they were opened', async ({
  page,
}) => {
  const fr = app(page);
  await fr.openTrends();
  await fr.goToSettings();

  await fr.closeWithIcon('settings');

  await expect(page).toHaveURL(/\/budgets\/current\/charts\/trends$/);
});

test('Done leaves settings for where they were opened', async ({ page }) => {
  const fr = app(page);
  await fr.goToBudgets();
  await fr.goToSettings();

  await fr.done();

  await expect(page).toHaveURL(/\/budgets$/);
});

test('settings opened from a link leave for the app’s start', async ({
  page,
}) => {
  const fr = app(page);
  await page.goto('/settings');

  await fr.done();

  await expect(page).toHaveURL(/\/budgets\/current$/);
});
