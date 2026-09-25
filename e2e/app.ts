import { expect, type Page } from '@playwright/test';

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

    /** Returns the path of the downloaded backup file. */
    async exportBackup() {
      await openForm();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export backup' }).click();
      return (await download).path();
    },

    async importBackup(file: string | { name: string; buffer: Buffer }) {
      await openForm();
      page.once('dialog', (dialog) => dialog.accept());
      const files =
        typeof file === 'string'
          ? file
          : { ...file, mimeType: 'application/json' };
      await page.setInputFiles('input[type=file]', files);
    },

    backupProblem: () => page.getByRole('alert'),

    lastBackup: () => page.getByText(/^Last backup:/),

    async clearEverything() {
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

    categoryHeading: (category: string) =>
      page.locator('h2', { hasText: new RegExp(`^\\s*${category}:`) }),

    cardsIn: (category: string | null) =>
      category === null
        ? page.locator('.fr__content-column > div').first().locator('.fr__card')
        : page
            .locator('.fr__content-column > div')
            .filter({ has: page.locator('h2', { hasText: `${category}:` }) })
            .locator('.fr__card'),
  };
}
