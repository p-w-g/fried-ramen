import { expect, type Locator, type Page } from '@playwright/test';

/** Drag target outside every drop zone: the page title. */
export const NOWHERE = Symbol('nowhere');

/**
 * The only file that knows the DOM. Specs describe behaviour through these
 * helpers so the same specs run against the legacy app and the ported one.
 */
export function app(page: Page) {
  const card = (name: string) =>
    page.locator('.fr__card').filter({
      has: page.locator('h3', { hasText: new RegExp(`^${name}$`) }),
    });

  const startEditing = (name: string) =>
    card(name).locator('li').nth(1).locator('img').click();

  const nav = page.getByRole('navigation');

  const goToBudgets = async () => {
    await nav.getByRole('link', { name: 'Budgets', exact: true }).click();
    await expect(page).toHaveURL(/\/budgets$/);
  };

  const budgetRow = (name: string) =>
    page.locator('.fr__budget').filter({
      has: page.locator('h3', { hasText: new RegExp(`^${name}$`) }),
    });

  const categoryHeading = (category: string) =>
    page.locator('h2', { hasText: new RegExp(`^\\s*${category}:`) });

  const center = async (locator: Locator) => {
    const box = await locator.boundingBox();
    if (!box) throw new Error('element is not visible');
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };

  const openForm = async () => {
    if (!(await page.locator('#expenses-form').isVisible())) {
      await page.locator('input.accordion').click();
    }
  };

  return {
    card,

    async goto() {
      await page.addInitScript(() => (Math.random = () => 0));
      await page.goto('/');
    },

    /** Seeds what the Vue CLI build left in localStorage, then opens the app. */
    async gotoWithLegacyData(expenses: object[], labels: string[]) {
      await page.addInitScript(
        ([expenses, labels]) => {
          localStorage.setItem('allExpensesList', JSON.stringify(expenses));
          localStorage.setItem('labels', JSON.stringify(labels));
        },
        [expenses, labels] as const,
      );
      await page.goto('/');
    },

    openForm,

    /** Waits for the closing animation, so positions measured next are final. */
    async closeForm() {
      if (await page.locator('#expenses-form').isVisible()) {
        await page.locator('input.accordion').click();
      }
      await expect(page.locator('#expenses-form')).toHaveCount(0);
    },

    startEditing,

    async addExpense(name: string, amount: number | '', description = '') {
      await openForm();
      await page.fill('#expense', name);
      await page.fill('#amount', String(amount));
      await page.fill('#description', description);
      await page.press('#amount', 'Enter');
    },

    async addCategory(name: string) {
      await openForm();
      await page.fill('#label', name);
      await page.press('#label', 'Enter');
    },

    async deleteEmptyCategory(name: string) {
      await openForm();
      await page.selectOption('#removal-menu', name);
    },

    async assignCategory(expense: string, category: string) {
      await card(expense).locator('select').selectOption(category);
    },

    categoryPicker: (expense: string) => card(expense).locator('select'),

    async completeExpense(name: string) {
      await card(name).locator('li').nth(0).locator('img').click();
    },

    async editExpense(
      name: string,
      changes: { name?: string; amount?: number; description?: string },
    ) {
      await startEditing(name);
      const editing = page.locator('.fr__card--edit-mode');
      const nameInput = editing.locator('.fr__card-header input').nth(0);
      const amountInput = editing.locator('.fr__card-header input').nth(1);
      if (changes.name !== undefined) await nameInput.fill(changes.name);
      if (changes.amount !== undefined)
        await amountInput.fill(String(changes.amount));
      if (changes.description !== undefined)
        await editing.locator('.fr__card-body input').fill(changes.description);
      await editing.locator('li').nth(1).locator('img').click();
    },

    goToBudgets,

    budgetRow,

    /** The navbar tab naming the budget that is open. */
    openBudgetTab: () => nav.getByRole('link').first(),

    async createBudget(name: string) {
      await goToBudgets();
      await page.fill('#budget-name', name);
      await page.getByRole('button', { name: 'Create budget' }).click();
    },

    async openBudget(name: string) {
      await goToBudgets();
      await page.getByRole('link', { name: `Open ${name}` }).click();
    },

    async renameBudget(name: string, newName: string) {
      await goToBudgets();
      await budgetRow(name).getByRole('button', { name: 'Rename' }).click();
      await page.getByLabel(`New name for ${name}`).fill(newName);
      await page.getByRole('button', { name: 'Save name' }).click();
    },

    async deleteBudget(name: string) {
      await goToBudgets();
      page.once('dialog', (dialog) => dialog.accept());
      await budgetRow(name).getByRole('button', { name: 'Delete' }).click();
    },

    problem: () => page.getByRole('alert'),

    /** Returns the path of the downloaded backup file. */
    async exportBackup() {
      await goToBudgets();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export backup' }).click();
      return (await download).path();
    },

    async importBackup(file: string | { name: string; buffer: Buffer }) {
      await goToBudgets();
      page.once('dialog', (dialog) => dialog.accept());
      const files =
        typeof file === 'string'
          ? file
          : { ...file, mimeType: 'application/json' };
      await page.setInputFiles('input[type=file]', files);
    },

    lastBackup: () => page.getByText(/^Last backup:/),

    async clearEverything() {
      page.once('dialog', (dialog) => dialog.accept());
      await page.locator('.fr__button--advance').click();
    },

    async expectTotal(total: number) {
      await expect(page.locator('h2', { hasText: /^All:/ })).toHaveText(
        `All: ${total}`,
      );
    },

    async expectCategoryTotal(category: string, total: number) {
      await expect(
        page.locator('h2', { hasText: new RegExp(`^\\s*${category}:`) }),
      ).toHaveText(`${category}: ${total}`);
    },

    categoryHeading,

    selectedText: () => page.evaluate(() => getSelection()?.toString() ?? ''),

    async longPress(expense: string) {
      const at = await center(card(expense).locator('h3'));
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.synthesizeTapGesture', {
        ...at,
        duration: 900,
        gestureSourceType: 'touch',
      });
    },

    /** Drags a card by its title onto a category heading (null: "All"). */
    async dragCard(
      expense: string,
      category: string | null | typeof NOWHERE,
      how: { with: 'mouse' } | { with: 'touch'; holdMs: number },
    ) {
      const from = await center(card(expense).locator('h3'));
      const target =
        category === NOWHERE
          ? page.locator('h1')
          : category === null
            ? page.locator('h2', { hasText: /^All:/ })
            : categoryHeading(category);
      const to = await center(target);
      const steps = Array.from({ length: 10 }, (_, i) => ({
        x: from.x + ((to.x - from.x) * (i + 1)) / 10,
        y: from.y + ((to.y - from.y) * (i + 1)) / 10,
      }));

      if (how.with === 'mouse') {
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (const step of steps) await page.mouse.move(step.x, step.y);
        await page.mouse.up();
        return;
      }

      const cdp = await page.context().newCDPSession(page);
      type TouchType = 'touchStart' | 'touchMove' | 'touchEnd';
      const touch = (type: TouchType, point?: { x: number; y: number }) =>
        cdp.send('Input.dispatchTouchEvent', {
          type,
          touchPoints: point ? [point] : [],
        });
      await touch('touchStart', from);
      await page.waitForTimeout(how.holdMs);
      for (const step of steps) await touch('touchMove', step);
      await touch('touchEnd');
    },

    cardsIn: (category: string | null) =>
      category === null
        ? page.locator('.fr__content-column > div').first().locator('.fr__card')
        : page
            .locator('.fr__content-column > div')
            .filter({ has: page.locator('h2', { hasText: `${category}:` }) })
            .locator('.fr__card'),
  };
}
