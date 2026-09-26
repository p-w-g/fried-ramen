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
  await expect(fr.renameProblem('Current')).toHaveText(
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

test('deleting every budget leaves a clean slate to start from', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.createBudget('Japan');

  await fr.deleteBudget('Japan');
  await expect(fr.budgetRow('Japan')).toHaveCount(0);
  await fr.deleteBudget('Current');

  await expect(page.getByText('No budgets yet.')).toBeVisible();
  await expect(fr.openBudgetTab()).toHaveText('Budgets');
  await page.goto('/');
  await expect(page).toHaveURL(/\/budgets$/);

  await fr.createBudget('Fresh start');
  await fr.expectTotal(0);
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

  await expect(
    page.getByRole('heading', { name: 'Budgets', level: 1 }),
  ).toBeVisible();
});

test('deleting asks in the app, and cancel or Esc keeps the budget', async ({
  page,
}) => {
  const fr = app(page);
  await fr.createBudget('Japan');
  await fr.goToBudgets();
  const deleteJapan = () => fr.budgetAction('Japan', 'Delete');
  const dialog = page.getByRole('dialog');

  await deleteJapan();
  await expect(dialog).toContainText('Delete “Japan” and everything in it?');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await fr.answerDialog('Cancel');
  await expect(fr.budgetRow('Japan')).toHaveCount(1);

  await deleteJapan();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(fr.budgetRow('Japan')).toHaveCount(1);
});

test('the budgets page shows each total, compact once it gets long', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 4.5);
  await fr.createBudget('Japan');
  await fr.addExpense('March', 180000);

  await fr.goToBudgets();

  await expect(fr.budgetTotal('Current')).toHaveText('4.50');
  await expect(fr.budgetTotal('Japan')).toHaveText('180K');
  await expect(fr.budgetRow('Japan')).toContainText('Total 180,000.00');
});

test('a tap anywhere on a budget row opens it, except on its menu', async ({
  page,
}) => {
  const fr = app(page);
  await fr.createBudget('Japan');
  await fr.goToBudgets();

  const row = await fr.budgetRow('Japan').boundingBox();
  await page.mouse.click(row!.x + row!.width * 0.6, row!.y + row!.height / 2);
  await expect(page).toHaveURL(/\?budget=japan$/);

  await fr.goToBudgets();
  const more = page.getByRole('button', { name: 'More for Japan' });
  // Near the corner: the icon itself stacks above the row link anyway.
  await more.click({ position: { x: 4, y: 4 } });
  const rename = fr.budgetRow('Japan').getByRole('button', { name: 'Rename' });
  await expect(rename).toBeVisible();
  await expect(page).toHaveURL(/\/budgets$/);
  await page.keyboard.press('Escape');
  await expect(rename).toBeHidden();
});
