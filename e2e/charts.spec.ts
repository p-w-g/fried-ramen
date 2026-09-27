import { expect, test, type Page } from '@playwright/test';
import { app } from './app';

/** Trends depend on the date; a fixed one keeps them the same every run. */
const at = (page: Page, day: string) =>
  page.clock.setFixedTime(new Date(`${day}T12:00`));

test.beforeEach(async ({ page }) => {
  const fr = app(page);
  await at(page, '2026-09-27');
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

test.describe('trends', () => {
  test('the past stays fixed: a correction is posted today, and completing keeps the amount', async ({
    page,
  }) => {
    const fr = app(page);
    await at(page, '2026-09-20');
    await fr.addExpense('Ramen', 5);
    await fr.expectTotal(25);
    await at(page, '2026-09-27');
    await fr.editExpense('Ramen', { amount: 50 });
    await fr.completeExpense('Ramen');
    await fr.expectTotal(20);

    await fr.openTrends();

    await expect(page).toHaveURL(/\/charts\/trends$/);
    await expect(fr.trendReadout()).toContainText('70.00');
    await expect(page.getByRole('row', { name: /^Sep 20 / })).toContainText(
      '5.00',
    );
  });

  test('switches between a month of days and a year of months', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.openTrends();
    const monthly = page.getByRole('button', { name: 'Monthly' });

    await monthly.click();

    await expect(monthly).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('row')).toHaveCount(12);
    await expect(fr.trendReadout()).toContainText('Sep 2026');
  });

  test('pointing at the line reads out that day', async ({ page }) => {
    const fr = app(page);
    await fr.openTrends();
    const plot = page.locator('.fr__trend-plot');

    const box = (await plot.boundingBox())!;
    await page.mouse.move(box.x + 1, box.y + box.height / 2);
    await expect(fr.trendReadout()).toContainText('Aug 29');

    await page.mouse.move(box.x, box.y + box.height + 200);
    await expect(fr.trendReadout()).toContainText('Sep 27');
  });
});
