import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('a Japanese format reads 300万 in the converter, in full above its result', async ({
  page,
}) => {
  const fr = app(page);
  await fr.mockRates({ 'JPY/SEK': 0.0631 });
  await fr.setSwitch('Converter', true);
  await fr.setNumberFormat('ja-JP');

  await fr.convert('300万', 'JPY', 'SEK');

  await expect(fr.typedEcho()).toHaveText('3,000,000 JPY');
  await expect(fr.conversion()).toHaveText('189,300');
  await expect(fr.shortConversion()).toHaveText('≈ 18.9万');
});

test('an Indian format reads lakhs and groups by them everywhere', async ({
  page,
}) => {
  const fr = app(page);
  await fr.mockRates({ 'SEK/JPY': 15.8511 });
  await fr.setSwitch('Converter', true);
  await fr.setNumberFormat('en-IN');

  await fr.convert('30L', 'SEK', 'JPY');
  await expect(fr.typedEcho()).toHaveText('30,00,000 SEK');
  await expect(fr.conversion()).toHaveText('4,75,53,300');
  await expect(fr.shortConversion()).toHaveText('≈ 4.76Cr');

  await fr.openBudget('Current');
  await fr.addExpense('Flat', 4755330.5);
  await expect(fr.shownTotal()).toHaveText('47,55,330.50');
  await fr.goToBudgets();
  await expect(fr.budgetTotal('Current')).toHaveText('47.6L');
});

test('the chosen format outlasts a reload, and Auto goes back to the phone', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Flat', 4755330.5);
  await fr.setNumberFormat('sv-SE');
  await page.reload();
  await fr.openBudget('Current');
  await expect(fr.shownTotal()).toHaveText('4 755 330,50');

  await fr.setNumberFormat('');
  await fr.openBudget('Current');

  await expect(fr.shownTotal()).toHaveText('4,755,330.50');
});

test.describe('on a German phone', () => {
  test.use({ locale: 'de-DE' });

  test('Auto writes amounts the German way', async ({ page }) => {
    const fr = app(page);

    await fr.addExpense('Flat', 4755330.5);

    await expect(fr.shownTotal()).toHaveText('4.755.330,50');
  });
});

test('a small result needs no short form', async ({ page }) => {
  const fr = app(page);
  await fr.mockRates({ 'SEK/JPY': 15.8511 });
  await fr.setSwitch('Converter', true);

  await fr.convert('100', 'SEK', 'JPY');

  await expect(fr.conversion()).toHaveText('1,585');
  await expect(fr.shortConversion()).toHaveCount(0);
});
