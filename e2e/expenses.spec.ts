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

test('amounts can have cents, and totals stay exact', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 0.1);
  await fr.addExpense('Tea', 0.2);
  await fr.expectTotal(0.3);

  await fr.editExpense('Tea', { amount: 1.25 });
  await fr.expectTotal(1.35);
});

test('a comma works as the decimal separator', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', '4,5');
  await fr.expectTotal(4.5);

  await fr.editExpense('Coffee', { amount: '2,25' });
  await fr.expectTotal(2.25);
});

test('an amount that is not a number is refused, not saved as 0', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 'abc');

  await expect(page.locator('#amount')).toHaveValue('abc');
  await expect(fr.card('Coffee')).toHaveCount(0);
});

test('amount fields ask phones for the decimal keyboard', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.startEditing('Coffee');

  for (const amountField of await fr.amountFields()) {
    await expect(amountField).toHaveAttribute('inputmode', 'decimal');
  }
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
  await fr.expectCategoryTotal('food', 5);

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

test('a total in the tens of millions still fits a phone screen', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Everything', 99_999_999.99);

  await fr.expectTotal(99_999_999.99);
  // Phones widen the layout to fit overflow, so compare with the device.
  const total = await page.locator('.fr__total .fr__amount').boundingBox();
  expect(total!.x + total!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test('one over-wide field never widens the whole page', async ({ page }) => {
  const fr = app(page);
  // Safari sizes inputs wider than Chromium; a grid on <body> once grew
  // to fit them and pushed the top bar and navbar off an iPhone screen.
  await page.addStyleTag({ content: '#expense { min-width: 30rem; }' });
  await fr.openForm();

  const toggle = await fr.themeToggle().boundingBox();
  const nav = await page.getByRole('navigation').boundingBox();
  const screenWidth = page.viewportSize()!.width;
  expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(screenWidth);
  expect(nav!.width).toBeLessThanOrEqual(screenWidth);
});
