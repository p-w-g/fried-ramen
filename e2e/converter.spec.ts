import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('the converter stays out of sight until it is switched on', async ({
  page,
}) => {
  const fr = app(page);
  await fr.goToBudgets();
  await expect(fr.converterLink()).toHaveCount(0);

  await page.goto('/convert');
  await expect(page).toHaveURL(/\/budgets$/);

  await fr.setSwitch('Converter', true);
  await fr.goToBudgets();
  await expect(fr.converterLink()).toBeVisible();
});

test('converts both ways, with the rate and its date', async ({ page }) => {
  const fr = app(page);
  await fr.mockRates({ 'SEK/JPY': 15.8511, 'JPY/SEK': 0.0631 });
  await fr.setSwitch('Converter', true);

  await fr.convert('100', 'SEK', 'JPY');

  await expect(fr.conversion()).toHaveText('¥1,585');
  await expect(fr.rateLine()).toHaveText(
    '1 SEK = 15.8511 JPY, rate from 2026-10-09',
  );

  await fr.swapCurrencies();

  await expect(fr.conversion()).toHaveText('SEK 6.31');
});

test('asks for a pair once a day, however often it is opened', async ({
  page,
}) => {
  const fr = app(page);
  const asked = await fr.mockRates({ 'SEK/JPY': 15.8511 });
  await fr.setSwitch('Converter', true);

  await fr.convert('100', 'SEK', 'JPY');
  await expect(fr.conversion()).toHaveText('¥1,585');
  await page.reload();
  await fr.convert('100', 'SEK', 'JPY');
  await expect(fr.conversion()).toHaveText('¥1,585');

  expect(asked.filter((pair) => pair === 'SEK/JPY')).toHaveLength(1);
});

test('says so when there has never been a rate to convert with', async ({
  page,
}) => {
  const fr = app(page);
  await fr.mockRates(null);
  await fr.setSwitch('Converter', true);

  await fr.convert('100', 'SEK', 'JPY');

  await expect(fr.problem()).toHaveText(
    'No exchange rate yet. Connect to the internet once to get one.',
  );
});

test('leads back to the budgets', async ({ page }) => {
  const fr = app(page);
  await fr.mockRates({});
  await fr.setSwitch('Converter', true);
  await fr.goToBudgets();
  await fr.converterLink().click();

  await page.getByRole('link', { name: 'Back to budgets' }).click();

  await expect(page).toHaveURL(/\/budgets$/);
});
