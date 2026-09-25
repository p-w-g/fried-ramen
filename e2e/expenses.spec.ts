import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('adding expenses sums them into the total', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addExpense('Shoes', 25, 'running');

  await expect(fr.card('Coffee')).toBeVisible();
  await expect(fr.card('Shoes')).toContainText('running');
  await fr.expectTotal(30);
});

test('form clears after saving an expense', async ({ page }) => {
  await app(page).addExpense('Coffee', 5, 'flat white');

  await expect(page.locator('#expense')).toHaveValue('');
  await expect(page.locator('#amount')).toHaveValue('');
  await expect(page.locator('#description')).toHaveValue('');
});

test('an expense can be saved with just an amount and named later', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('', 12);
  await fr.expectTotal(12);

  await fr.editExpense('', { name: 'Lunch' });
  await expect(fr.card('Lunch')).toBeVisible();
  await fr.expectTotal(12);
});

test('completing an expense removes exactly that one', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addExpense('Savings', 50);
  await fr.addExpense('Shoes', 25);

  await fr.completeExpense('Savings');

  await expect(fr.card('Savings')).toHaveCount(0);
  await expect(fr.card('Coffee')).toBeVisible();
  await expect(fr.card('Shoes')).toBeVisible();
  await fr.expectTotal(30);
});

test('editing an expense updates it and the total', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);

  await fr.editExpense('Coffee', { name: 'Tea', amount: 3 });

  await expect(fr.card('Tea')).toBeVisible();
  await expect(fr.card('Coffee')).toHaveCount(0);
  await fr.expectTotal(3);
});

test('expenses and categories survive a reload', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');

  await page.reload();

  await fr.expectCategoryTotal('food', 5);
  await expect(fr.cardsIn('food')).toHaveCount(1);
});

test('clearing everything removes all expenses and categories', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addCategory('food');

  await fr.clearEverything();

  await fr.expectTotal(0);
  await expect(fr.card('Coffee')).toHaveCount(0);
  await expect(fr.categoryHeading('food')).toHaveCount(0);
});
