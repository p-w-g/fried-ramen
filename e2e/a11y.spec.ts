import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { app } from './app';

const violations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
};

test.beforeEach(async ({ page }) => {
  // Also keeps axe from scanning half-faded elements.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const fr = app(page);
  await fr.goto();
  await fr.addExpense('Coffee', 5, 'flat white');
  await fr.addExpense('', 12);
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');
  await fr.expectCategoryTotal('food', 5);
});

test('the budget page with the form open has no axe violations', async ({
  page,
}) => {
  expect(await violations(page)).toEqual([]);
});

test('a card in edit mode has no axe violations', async ({ page }) => {
  await app(page).startEditing('Coffee');

  expect(await violations(page)).toEqual([]);
});

test('the budgets page has no axe violations', async ({ page }) => {
  await app(page).goToBudgets();

  expect(await violations(page)).toEqual([]);
});

test('the unknown budget page has no axe violations', async ({ page }) => {
  await page.goto('/?budget=nope');
  await page.getByText('There is no budget called “nope”.').waitFor();

  expect(await violations(page)).toEqual([]);
});

test('a card can be edited and completed from the keyboard', async ({
  page,
}) => {
  const fr = app(page);

  await page.getByRole('button', { name: 'Edit Coffee' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: 'Amount of Coffee' }).fill('7');
  await page.getByRole('button', { name: 'Save Coffee' }).focus();
  await page.keyboard.press('Enter');
  await fr.expectCategoryTotal('food', 7);

  await page.getByRole('button', { name: 'Complete Coffee' }).focus();
  await page.keyboard.press('Space');
  await fr.expectCategoryTotal('food', 0);
});

test('toggles say whether they are open and work from the keyboard', async ({
  page,
}) => {
  const fr = app(page);
  const formToggle = fr.formToggle;
  const foodToggle = page.getByRole('button', { name: 'food 5.00' });
  await expect(formToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(foodToggle).toHaveAttribute('aria-expanded', 'true');

  await foodToggle.focus();
  await page.keyboard.press('Enter');

  await expect(foodToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(fr.card('Coffee')).toBeHidden();
});

test('an expense without a name is announced as unnamed', async ({ page }) => {
  await expect(
    page.getByRole('combobox', { name: 'Category of unnamed expense' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Unnamed expense' }),
  ).toBeAttached();
});

test('the confirm dialog has no axe violations', async ({ page }) => {
  const fr = app(page);
  await fr.goToBudgets();
  await fr.budgetAction('Current', 'Delete');
  await expect(page.getByRole('dialog')).toBeVisible();

  expect(await violations(page)).toEqual([]);
});

test('a budget menu has no axe violations', async ({ page }) => {
  await app(page).goToBudgets();
  await page.getByRole('button', { name: 'More for Current' }).click();
  await expect(page.getByRole('button', { name: 'Rename' })).toBeVisible();

  expect(await violations(page)).toEqual([]);
});

test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' });

  test('the budget page has no axe violations', async ({ page }) => {
    expect(await violations(page)).toEqual([]);
  });

  test('the budgets page has no axe violations', async ({ page }) => {
    await app(page).goToBudgets();

    expect(await violations(page)).toEqual([]);
  });
});
