import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  const fr = app(page);
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
