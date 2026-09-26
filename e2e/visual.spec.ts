import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  const fr = app(page);
  // Whether the browser grants persistent storage varies by environment.
  await page.addInitScript(() => {
    navigator.storage.persist = () => Promise.resolve(false);
  });
  await fr.goto();
  await page.evaluate(() => document.fonts.ready);
});

test('empty app with the form closed', async ({ page }) => {
  await expect(page).toHaveScreenshot('empty.png', { fullPage: true });
});

test('form open with categorised and unassigned expenses', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5, 'flat white');
  await fr.addExpense('Shoes', 25);
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');

  await expect(page).toHaveScreenshot('populated.png', { fullPage: true });
});

test('card in edit mode', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5, 'flat white');
  await fr.startEditing('Coffee');

  await expect(page).toHaveScreenshot('editing.png', { fullPage: true });
});

test('collapsed category', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');
  await fr.categoryHeading('food').click();

  await expect(page).toHaveScreenshot('collapsed.png', { fullPage: true });
});

test('budgets page', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 4.5);
  await fr.createBudget('April Tour of Japan');
  await fr.addExpense('Everything', 8_240_000);
  await fr.goToBudgets();

  await expect(page).toHaveScreenshot('budgets.png', { fullPage: true });
});

test('unknown budget', async ({ page }) => {
  await page.goto('/?budget=nope');
  await page.getByText('There is no budget called “nope”.').waitFor();

  await expect(page).toHaveScreenshot('unknown-budget.png', { fullPage: true });
});

test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' });

  test('form open with categorised and unassigned expenses', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.addExpense('Coffee', 5, 'flat white');
    await fr.addExpense('', 25);
    await fr.addCategory('food');
    await fr.assignCategory('Coffee', 'food');

    await expect(page).toHaveScreenshot('populated-dark.png', {
      fullPage: true,
    });
  });

  test('budgets page with a row menu open', async ({ page }) => {
    const fr = app(page);
    await fr.createBudget('April Tour of Japan');
    await fr.goToBudgets();
    await page.getByRole('button', { name: 'More for Current' }).click();

    await expect(page).toHaveScreenshot('budgets-menu-dark.png');
  });

  test('the delete dialog', async ({ page }) => {
    const fr = app(page);
    await fr.createBudget('April Tour of Japan');
    await fr.goToBudgets();
    await fr.budgetAction('Current', 'Delete');

    // The backdrop blends the page nondeterministically; the dialog is the point.
    await expect(page.getByRole('dialog')).toHaveScreenshot(
      'delete-dialog-dark.png',
    );
  });
});
