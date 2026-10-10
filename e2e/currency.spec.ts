import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  const fr = app(page);
  await fr.goto();
  await fr.mockRates({});
});

test('a budget made in yen shows yen wherever its amounts are', async ({
  page,
}) => {
  const fr = app(page);
  await fr.setCurrencyMode(true);

  await fr.createBudget('Japan', 'JPY');
  await fr.addExpense('Ramen', 1500);

  await expect(fr.shownAmount('Ramen')).toHaveText('¥1,500');
  await expect(fr.shownTotal()).toHaveText('¥1,500');
  await expect(page.getByLabel('Amount (JPY)')).toBeAttached();
  await fr.goToBudgets();
  await expect(fr.budgetRow('Japan')).toContainText('1,500.00 JPY');
});

test('currency mode off reads as before, and on again brings currencies back', async ({
  page,
}) => {
  const fr = app(page);
  await fr.setCurrencyMode(true);
  await fr.createBudget('Japan', 'JPY');
  await fr.addExpense('Ramen', 1500);

  await fr.setCurrencyMode(false);
  await fr.openBudget('Japan');

  await fr.expectTotal(1500);
  await expect(fr.budgetCurrency()).toHaveCount(0);

  await fr.setCurrencyMode(true);
  await fr.openBudget('Japan');
  await expect(fr.shownTotal()).toHaveText('¥1,500');
});

test('a budget from before currency mode gets one later, relabelled and not converted', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 4.5);
  await fr.setCurrencyMode(true);
  await fr.openBudget('Current');
  await expect(fr.shownTotal()).toHaveText('4.50');

  await fr.budgetCurrency().selectOption('SEK');

  await expect(fr.shownTotal()).toHaveText('SEK 4.50');
  await page.reload();
  await expect(fr.budgetCurrency()).toHaveValue('SEK');
});

test.describe('shown in another currency', () => {
  test.beforeEach(async ({ page }) => {
    const fr = app(page);
    await page.context().unrouteAll();
    await fr.setCurrencyMode(true);
    await fr.createBudget('Stockholm', 'SEK');
    await fr.addExpense('Ramen', 100);
    await fr.addExpense('Tea', 33.33);
  });

  test('each amount converts, and the total adds up what is shown', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.mockRates({ 'SEK/JPY': 15.8511 });

    await fr.showIn('JPY');

    await expect(fr.shownAmount('Ramen')).toHaveText('¥1,585');
    await expect(fr.shownAmount('Tea')).toHaveText('¥528');
    await expect(fr.shownTotal()).toHaveText('¥2,113');
    await expect(fr.rateNote()).toContainText(
      'Converted at 1 SEK = 15.8511 JPY, rate from 2026-10-09.',
    );
    await expect(page.getByLabel('Amount (SEK)')).toBeAttached();
  });

  test('categories convert too, while the charts stay in the budget currency', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.mockRates({ 'SEK/JPY': 15.8511 });
    await fr.addCategory('food');
    await fr.assignCategory('Ramen', 'food');
    await fr.showIn('JPY');

    await expect(fr.categoryHeading('food')).toContainText('¥1,585');
    await fr.chartsToggle().click();
    await expect(fr.legendRows().filter({ hasText: 'food' })).toContainText(
      '100.00',
    );
  });

  test('the choice holds across budgets and reloads, until set back', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.mockRates({ 'SEK/JPY': 15.8511 });
    await fr.showIn('JPY');
    await fr.createBudget('Gothenburg', 'SEK');
    await fr.addExpense('Fika', 100);

    await page.reload();
    await expect(fr.shownTotal()).toHaveText('¥1,585');

    await fr.showIn('');
    await expect(fr.shownTotal()).toHaveText('SEK 100.00');
    await expect(fr.rateNote()).toHaveCount(0);
  });

  test('without any rate it stays in its own currency and says why', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.mockRates(null);

    await fr.showIn('JPY');

    await expect(fr.problem()).toContainText('No exchange rate yet');
    await expect(fr.shownTotal()).toHaveText('SEK 133.33');
  });

  test('turning currency mode off stops asking for rates', async ({ page }) => {
    const fr = app(page);
    const asked = await fr.mockRates({ 'SEK/JPY': 15.8511, 'PLN/JPY': 37.1 });
    await fr.createBudget('Warsaw', 'PLN');
    await fr.openBudget('Stockholm');
    await fr.showIn('JPY');
    await expect(fr.shownTotal()).toHaveText('¥2,113');

    await fr.setCurrencyMode(false);
    await fr.openBudget('Warsaw');
    await fr.expectTotal(0);

    expect(asked).toEqual(['SEK/JPY']);
  });
});
