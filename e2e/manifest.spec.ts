import { expect, test } from '@playwright/test';

type ManifestIcon = { src: string; sizes: string; purpose?: string };

/** Icons are fetched on install, not by the page, but they still cost data. */
const ICON_BUDGET_BYTES = 100_000;

test('the manifest identifies the app and its icons are light and real', async ({
  page,
  request,
}) => {
  const manifest = (await (await request.get('/manifest.json')).json()) as {
    id?: string;
    icons: ManifestIcon[];
  };
  expect(manifest.id).toBe('/');
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);

  await page.goto('/');
  for (const icon of manifest.icons) {
    const url = new URL(icon.src, 'http://host/').pathname;
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect((await response.body()).length, url).toBeLessThanOrEqual(
      ICON_BUDGET_BYTES,
    );
    const size = await page.evaluate(async (iconUrl) => {
      const bitmap = await createImageBitmap(
        await (await fetch(iconUrl)).blob(),
      );
      return `${bitmap.width}x${bitmap.height}`;
    }, url);
    expect(size, url).toBe(icon.sizes);
  }
});
