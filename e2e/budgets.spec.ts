import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('the app opens the "Current" budget by its slug', async ({ page }) => {
  await expect(page).toHaveURL(/\/\?budget=current$/);
  await expect(app(page).openBudgetTab()).toHaveText('Current');
});

test('a new budget opens empty and keeps its own expenses', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.expectTotal(5);

  await fr.createBudget('April Tour of Japan');

  await expect(page).toHaveURL(/\?budget=april_tour_of_japan$/);
  await expect(fr.openBudgetTab()).toHaveText('April Tour of Japan');
  await fr.expectTotal(0);
  await fr.addExpense('Ramen', 9);
  await fr.expectTotal(9);

  await fr.openBudget('Current');
  await fr.expectTotal(5);
  await expect(fr.card('Ramen')).toHaveCount(0);
});

test('names that would share a URL are refused', async ({ page }) => {
  const fr = app(page);
  await fr.createBudget('All my debt');

  await fr.createBudget('all  MY debt');
  await expect(fr.problem()).toHaveText(
    'A budget called “All my debt” already exists.',
  );

  await fr.renameBudget('Current', 'ALL MY DEBT');
  await expect(fr.problem()).toHaveText(
    'A budget called “All my debt” already exists.',
  );
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(fr.budgetRow('Current')).toHaveCount(1);
});

test('renaming moves the URL; the old one says the budget is gone', async ({
  page,
}) => {
  const fr = app(page);
  await fr.renameBudget('Current', 'Everyday');
  await fr.openBudget('Everyday');
  await expect(page).toHaveURL(/\?budget=everyday$/);

  await page.goto('/?budget=current');

  await expect(
    page.getByText('There is no budget called “current”.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Go to budgets' }).click();
  await expect(page).toHaveURL(/\/budgets$/);
});

test('an unknown budget in the URL stays put and offers the way back', async ({
  page,
}) => {
  await page.goto('/?budget=nope');

  await expect(page).toHaveURL(/\?budget=nope$/);
  await expect(
    page.getByText('There is no budget called “nope”.'),
  ).toBeVisible();
});

test('deleting a budget removes it; the last one cannot be deleted', async ({
  page,
}) => {
  const fr = app(page);
  await fr.createBudget('Japan');

  await fr.deleteBudget('Japan');

  await expect(fr.budgetRow('Japan')).toHaveCount(0);
  await expect(
    fr.budgetRow('Current').getByRole('button', { name: 'Delete' }),
  ).toBeDisabled();
});

test('reopening the app lands on the budget used last', async ({ page }) => {
  const fr = app(page);
  await fr.createBudget('Japan');
  await expect(page).toHaveURL(/\?budget=japan$/);

  await page.goto('/');

  await expect(page).toHaveURL(/\?budget=japan$/);
});

test('/budgets works as a direct link', async ({ page }) => {
  await page.goto('/budgets');

  await expect(page.getByRole('heading', { name: '🍱 Budgets' })).toBeVisible();
});
