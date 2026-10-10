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
