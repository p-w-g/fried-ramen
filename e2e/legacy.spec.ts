import { expect, test } from '@playwright/test';
import { app } from './app';

test('data saved by the Vue CLI build shows up on first open', async ({
  page,
}) => {
  const fr = app(page);
  await fr.gotoWithLegacyData(
    [
      {
        Expense: 'Coffee',
        Amount: 5,
        Description: 'flat',
        Id: 1,
        Label: 'food',
        isPostponed: false,
      },
      { Expense: '', Amount: 12, Id: 2, isPostponed: false },
      {
        Expense: 'Shoes',
        Amount: 25,
        Id: 3,
        Label: 'lost category',
        isPostponed: false,
      },
    ],
    ['food'],
  );

  await fr.expectTotal(42);
  await fr.expectCategoryTotal('food', 5);
  await fr.expectCategoryTotal('lost category', 25);
  await expect(fr.cardsIn(null)).toHaveCount(1);
  await expect(fr.card('Coffee')).toContainText('flat');
});

test('legacy data does not come back after every budget is deleted', async ({
  page,
}) => {
  const fr = app(page);
  await fr.gotoWithLegacyData(
    [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
    [],
  );
  await fr.expectTotal(5);

  await fr.deleteBudget('Current');
  await expect(page.getByText('No budgets yet.')).toBeVisible();
  await page.goto('/');

  await expect(page).toHaveURL(/\/budgets$/);
  await expect(page.getByText('No budgets yet.')).toBeVisible();
});
