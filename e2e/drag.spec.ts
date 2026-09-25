import { expect, test } from '@playwright/test';
import { app, NOWHERE } from './app';

test.beforeEach(async ({ page }) => {
  const fr = app(page);
  await fr.goto();
  await fr.addExpense('Coffee', 5);
  await fr.addExpense('Shoes', 25);
  await fr.addCategory('food');
  await fr.expectCategoryTotal('food', 0);
  await fr.closeForm();
});

test('a mouse drags a card into a category and back', async ({ page }) => {
  const fr = app(page);

  await fr.dragCard('Coffee', 'food', { with: 'mouse' });
  await fr.expectCategoryTotal('food', 5);
  await expect(fr.cardsIn('food')).toHaveCount(1);

  await fr.dragCard('Coffee', null, { with: 'mouse' });
  await fr.expectCategoryTotal('food', 0);
  await expect(fr.cardsIn(null)).toHaveCount(2);
});

test('a finger held on a card drags it into a category', async ({ page }) => {
  const fr = app(page);

  await fr.dragCard('Shoes', 'food', { with: 'touch', holdMs: 500 });

  await fr.expectCategoryTotal('food', 25);
});

test('a quick swipe scrolls instead of dragging', async ({ page }) => {
  const fr = app(page);

  await fr.dragCard('Shoes', 'food', { with: 'touch', holdMs: 0 });

  await fr.expectCategoryTotal('food', 0);
  await expect(fr.cardsIn(null)).toHaveCount(2);
});

test('dropping outside any category changes nothing', async ({ page }) => {
  const fr = app(page);

  await fr.dragCard('Coffee', NOWHERE, { with: 'mouse' });

  await expect(fr.cardsIn(null)).toHaveCount(2);
  await fr.expectCategoryTotal('food', 0);
});
