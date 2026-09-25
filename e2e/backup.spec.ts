import { expect, test } from '@playwright/test';
import { app } from './app';

test.beforeEach(async ({ page }) => {
  await app(page).goto();
});

test('an exported backup restores everything after a wipe', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 4.5, 'flat white');
  await fr.addCategory('food');
  await fr.assignCategory('Coffee', 'food');
  await fr.expectCategoryTotal('food', 4.5);

  const backupFile = await fr.exportBackup();
  await expect(fr.lastBackup()).toHaveText('Last backup: today');
  await fr.openBudget('Current');
  await fr.clearEverything();
  await fr.expectTotal(0);

  await fr.importBackup(backupFile);
  await fr.openBudget('Current');

  await fr.expectCategoryTotal('food', 4.5);
  await expect(fr.card('Coffee')).toContainText('flat white');
});

test('a file that is not a backup is refused and changes nothing', async ({
  page,
}) => {
  const fr = app(page);
  await fr.addExpense('Coffee', 5);
  await fr.expectTotal(5);

  await fr.importBackup({
    name: 'notes.json',
    buffer: Buffer.from('{"hello": "world"}'),
  });

  await expect(fr.problem()).toHaveText('This is not a Fried Ramen backup.');
  await fr.openBudget('Current');
  await fr.expectTotal(5);
});
