import { expect, test, type Locator } from '@playwright/test';
import { app } from './app';

const box = async (locator: Locator) => (await locator.boundingBox())!;

test('the form and the list sit side by side on wide screens and stack on phones', async ({
  page,
}, testInfo) => {
  const fr = app(page);
  await fr.goto();
  await fr.addExpense('Coffee', 5);

  const form = await box(fr.formToggle);
  const list = await box(page.locator('.fr__groups'));

  if (testInfo.project.name === 'mobile') {
    expect(list.y).toBeGreaterThan(form.y + form.height);
  } else {
    expect(list.x).toBeGreaterThan(form.x + form.width);
  }
});

test('a folded phone on its side keeps one column: too short for two', async ({
  page,
}) => {
  await page.setViewportSize({ width: 915, height: 340 });
  const fr = app(page);
  await fr.goto();

  const form = await box(fr.formToggle);
  const list = await box(page.locator('.fr__groups'));

  expect(list.y).toBeGreaterThan(form.y + form.height);
});
