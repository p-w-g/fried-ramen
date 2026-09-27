import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  const fr = app(page);
  await fr.goto();
  await fr.addExpense('Coffee', 5);
  await fr.addExpense('Shoes', 15);
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');
});

test('the mini donut sits first in the bottom bar, where the budget tab was', async ({
  page,
}) => {
  const tabs = page.getByRole('navigation').getByRole('link');

  await expect(tabs).toHaveCount(2);
  await expect(tabs.first()).toHaveAccessibleName('Charts');
});

test('the mini donut opens the overview, and taps back to the list', async ({
  page,
}) => {
  const fr = app(page);

  await fr.chartsToggle().click();

  await expect(page).toHaveURL(/\/budgets\/current\/charts\/overview$/);
  await expect(fr.pageTitle()).toHaveText('Current');
  await expect(fr.legendRows()).toHaveText([
    /Uncategorised\s*15\.00\s*75%/,
    /food\s*5\.00\s*25%/,
  ]);

  await fr.expensesToggle().click();

  await expect(page).toHaveURL(/\/budgets\/current$/);
});

test('negative amounts stay out of the donut, with a note saying so', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Refund', -10);
  await fr.chartsToggle().click();

  await expect(fr.legendRows()).toHaveCount(2);
  await expect(
    page.getByText('* negative amounts are not shown'),
  ).toBeVisible();
});

test('/charts on its own opens the overview', async ({ page }) => {
  await page.goto('/budgets/current/charts');

  await expect(page).toHaveURL(/\/budgets\/current\/charts\/overview$/);
});
