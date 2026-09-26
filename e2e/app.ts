import { expect, type Locator, type Page } from '@playwright/test';

/** Drag target outside every drop zone: the page title. */
export const NOWHERE = Symbol('nowhere');

/**
 * The only file that knows the DOM. Specs describe behaviour through these
 * helpers so specs survive markup changes; only this file needs updating.
 */
/** Amounts show with two decimals, as the en-US test browsers format them. */
const shown = (amount: number) =>
  amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function app(page: Page) {
  const card = (name: string) =>
    page.locator('.fr__entry').filter({
      has: page.locator('h3', {
        hasText: new RegExp(`^${name || 'Unnamed expense'}$`),
      }),
    });

  /** Buttons are named after their expense; nameless ones are "unnamed expense". */
  const expenseButton = (action: string, name: string) =>
    page.getByRole('button', {
      name: `${action} ${name || 'unnamed expense'}`,
      exact: true,
    });

  const startEditing = (name: string) => expenseButton('Edit', name).click();

  const nav = page.getByRole('navigation');

  const goToBudgets = async () => {
    await nav.getByRole('link', { name: 'Budgets', exact: true }).click();
    await expect(page).toHaveURL(/\/budgets$/);
  };

  const budgetRow = (name: string) =>
    page.locator('.fr__budget').filter({
      has: page.locator('h3', { hasText: new RegExp(`^${name}$`) }),
    });

  /** A category's section; null is the one for uncategorised expenses. */
  const group = (category: string | null) =>
    page.locator(`[data-drop-category=${JSON.stringify(category ?? '')}]`);

  const categoryHeading = (category: string) => group(category).locator('h2');

  const formToggle = page.getByRole('button', { name: 'Add expense' });

  const center = async (locator: Locator) => {
    const box = await locator.boundingBox();
    if (!box) throw new Error('element is not visible');
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };

  /** Answers the in-app confirm dialog by the label of its button. */
  const answerDialog = async (label: string) => {
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: label, exact: true }).click();
    await expect(dialog).toBeHidden();
  };

  const openForm = async () => {
    if (!(await page.locator('#expenses-form').isVisible())) {
      await formToggle.click();
    }
  };

  return {
    card,

    async goto() {
      await page.addInitScript(() => (Math.random = () => 0));
      await page.goto('/');
    },

    openForm,

    formToggle,

    /** Waits for the closing animation, so positions measured next are final. */
    async closeForm() {
      if (await page.locator('#expenses-form').isVisible()) {
        await formToggle.click();
      }
      await expect(page.locator('#expenses-form')).toHaveCount(0);
    },

    startEditing,

    async addExpense(name: string, amount: number | string, description = '') {
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
      await expenseButton('Complete', name).click();
    },

    async editExpense(
      name: string,
      changes: {
        name?: string;
        amount?: number | string;
        description?: string;
      },
    ) {
      await startEditing(name);
      const editing = page.locator('.fr__entry--edit-mode');
      if (changes.name !== undefined)
        await editing.locator('input.fr__entry-name').fill(changes.name);
      if (changes.amount !== undefined)
        await editing
          .locator('input.fr__entry-amount')
          .fill(String(changes.amount));
      if (changes.description !== undefined)
        await editing
          .locator('input.fr__entry-description')
          .fill(changes.description);
      await expenseButton('Save', name).click();
    },

    goToBudgets,

    answerDialog,

    themeToggle: () =>
      page.getByRole('button', { name: /^Switch to (light|dark) theme$/ }),

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
      await budgetRow(name).getByRole('button', { name: 'Delete' }).click();
      await answerDialog('Delete');
    },

    problem: () => page.getByRole('alert'),

    /** Scoped, since the create form's problem can still be showing. */
    renameProblem: (name: string) =>
      page
        .locator('form', { has: page.getByLabel(`New name for ${name}`) })
        .getByRole('alert'),

    /** Returns the path of the downloaded backup file. */
    async exportBackup() {
      await goToBudgets();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export backup' }).click();
      return (await download).path();
    },

    async importBackup(file: string | { name: string; buffer: Buffer }) {
      await goToBudgets();
      const files =
        typeof file === 'string'
          ? file
          : { ...file, mimeType: 'application/json' };
      await page.setInputFiles('input[type=file]', files);
      await answerDialog('Replace');
    },

    lastBackup: () => page.getByText(/^Last backup:/),

    async clearEverything() {
      await page.getByRole('button', { name: /^Clear / }).click();
      await answerDialog('Clear');
    },

    async expectTotal(total: number) {
      await expect(page.locator('.fr__total .fr__amount')).toHaveText(
        shown(total),
      );
    },

    async expectCategoryTotal(category: string, total: number) {
      await expect(categoryHeading(category).locator('.fr__amount')).toHaveText(
        shown(total),
      );
    },

    categoryHeading,

    /**
     * From now on every IndexedDB write fails, as when storage is full.
     * Waits for the start-up write (last opened budget) first, so its
     * failure cannot be mistaken for the one under test.
     */
    breakStorageWrites: async () => {
      await page.waitForFunction(
        () =>
          new Promise<boolean>((resolve) => {
            const opening = indexedDB.open('fried-ramen');
            opening.onsuccess = () => {
              const database = opening.result;
              const reading = database
                .transaction('meta')
                .objectStore('meta')
                .get('lastBudgetId');
              reading.onsuccess = () => {
                database.close();
                resolve(reading.result !== undefined);
              };
            };
          }),
      );
      await page.evaluate(() => {
        const fail = () => {
          throw new DOMException('The disk is full', 'QuotaExceededError');
        };
        IDBObjectStore.prototype.add = fail;
        IDBObjectStore.prototype.put = fail;
        IDBCursor.prototype.update = fail;
      });
    },

    errorAlert: () => page.getByRole('alert').filter({ hasText: 'went wrong' }),

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

    /** The form's amount field plus the one on any card being edited. */
    amountFields: async () => [
      page.locator('#amount'),
      ...(await page
        .locator('.fr__entry--edit-mode input.fr__entry-amount')
        .all()),
    ],

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
            ? group(null).locator('h2')
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

    cardsIn: (category: string | null) => group(category).locator('.fr__entry'),
  };
}
