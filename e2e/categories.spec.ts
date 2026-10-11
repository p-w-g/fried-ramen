import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('assigning a category moves the expense and its amount', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.addExpense('Savings', 50);
  await fr.addExpense('Shoes', 25);
  await fr.addCategory('hype yo');
  await fr.addCategory('Save&Invest');

  await fr.assignCategory('Shoes', 'hype yo');
  await fr.assignCategory('Savings', 'Save&Invest');

  await fr.expectCategoryTotal('hype yo', 25);
  await fr.expectCategoryTotal('Save&Invest', 50);
  await expect(fr.cardsIn(null)).toHaveCount(1);
  await fr.expectTotal(80);
});

test('an empty category can be deleted', async ({ page }) => {
  const fr = app(page);
  await fr.addCategory('first');
  await fr.addCategory('second');
  await fr.addCategory('third');

  await fr.deleteEmptyCategory('first');

  await expect(fr.categoryHeading('first')).toHaveCount(0);
  await fr.expectCategoryTotal('second', 0);
  await fr.expectCategoryTotal('third', 0);
});

test('only unused categories are offered for deletion', async ({ page }) => {
  const fr = app(page);
  await fr.addExpense('Shoes', 25);
  await fr.addCategory('hype yo');
  await fr.addCategory('spare');
  await fr.assignCategory('Shoes', 'hype yo');

  await expect(await fr.deletableCategories()).toHaveText(['spare']);

  await fr.completeExpense('Shoes');
  await expect(await fr.deletableCategories()).toHaveText(['hype yo', 'spare']);
  await fr.deleteEmptyCategory('hype yo');
  await expect(fr.categoryHeading('hype yo')).toHaveCount(0);
});

test('with every category in use there is nothing to delete', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Shoes', 25);
  await fr.addCategory('hype yo');
  await fr.assignCategory('Shoes', 'hype yo');

  await expect(await fr.deletableCategories()).toHaveCount(0);
  await expect(page.getByLabel('Delete an unused category')).toHaveCount(0);
});

test('categories have their own section, apart from adding expenses', async ({
  page,
}) => {
  const fr = app(page);
  await fr.openForm();
  await expect(page.getByLabel('New category')).toHaveCount(0);

  await fr.addCategory('food');

  await expect(fr.categoryHeading('food')).toBeVisible();
});

test.describe('card state follows its expense, not its position', () => {
  test('the next card does not inherit the category picker of the moved one', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.addExpense('First', 1);
    await fr.addExpense('Second', 2);
    await fr.addCategory('food');
    await fr.assignCategory('First', 'food');

    await expect(fr.categoryPicker('Second')).toHaveValue('');
    await expect(fr.categoryPicker('First')).toHaveValue('food');
  });

  test('editing the next card does not overwrite it with the moved one', async ({
    page,
  }) => {
    const fr = app(page);
    await fr.addExpense('First', 1, 'one');
    await fr.addExpense('Second', 2, 'two');
    await fr.addCategory('food');
    await fr.assignCategory('First', 'food');

    await fr.editExpense('Second', { amount: 20 });

    await expect(fr.card('Second')).toContainText('20');
    await expect(fr.card('Second')).toContainText('two');
    await expect(fr.card('First')).toHaveCount(1);
  });
});
