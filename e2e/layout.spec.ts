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

test('a form pinned beside the list never hides its lower part under the bottom bar', async ({
  page,
}) => {
  const fr = app(page);
  await fr.goto();
  for (const name of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
    await fr.addExpense(name, 1);
  }
  await fr.addCategory('food');
  const total = page.locator('.fr__summary');
  const list = await box(page.locator('.fr__groups'));
  await page.mouse.move(list.x + list.width / 2, list.y + 50);
  const scrollBy = async (pixels: number) => {
    const from = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, pixels);
    await page.waitForFunction((y) => window.scrollY > y, from);
  };

  // A pinned pane slides up to the top on the first scroll, then holds.
  await scrollBy(300);
  const settled = await box(total);
  await scrollBy(200);
  const isPinned = (await box(total)).y === settled.y;

  const lastControl = await box(page.getByLabel('Delete an empty category'));
  const bottomBar = await box(page.getByRole('navigation'));
  if (isPinned) {
    expect(lastControl.y + lastControl.height).toBeLessThanOrEqual(bottomBar.y);
  }
});
