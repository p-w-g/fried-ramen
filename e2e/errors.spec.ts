import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('a failed save is reported and what was typed stays in the form', async ({
  page,
}) => {
  const fr = app(page);
  await fr.breakStorageWrites();

  await fr.addExpense('Coffee', 5, 'flat white');

  await expect(fr.errorAlert()).toContainText('The disk is full');
  await expect(page.locator('#expense')).toHaveValue('Coffee');
  await expect(page.locator('#description')).toHaveValue('flat white');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(fr.errorAlert()).toBeHidden();
});

test('a failed save after a drag is reported too', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addCategory('food');
  await fr.expectCategoryTotal('food', 0);
  await fr.closeForm();
  await fr.breakStorageWrites();

  await fr.dragCard('Coffee', 'food', { with: 'mouse' });

  await expect(fr.errorAlert()).toContainText('The disk is full');
  await fr.expectCategoryTotal('food', 0);
});

test('a failure outside storage is reported, e.g. a blocked download', async ({
  page,
}) => {
  const fr = app(page);
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error('Downloads are blocked');
    };
  });

  await fr.goToBudgets();
  await page.getByRole('button', { name: 'Export backup' }).click();

  await expect(fr.errorAlert()).toContainText('Downloads are blocked');
});

test('an error notice pushes the page down instead of covering it', async ({
  page,
}) => {
  const fr = app(page);
  await fr.breakStorageWrites();
  await fr.addExpense('Coffee', 5);
  await expect(fr.errorAlert()).toBeVisible();

  const notice = await fr.errorAlert().boundingBox();
  const content = await page.getByRole('main').boundingBox();
  expect(notice!.y + notice!.height).toBeLessThanOrEqual(content!.y);
});
