import { ref } from 'vue';

export type Theme = 'light' | 'dark';

const systemPrefersDark = matchMedia('(prefers-color-scheme: dark)');

/** Set before first paint by index.html from the stored choice, if any. */
function chosenTheme(): Theme | null {
  const chosen = document.documentElement.dataset.theme;
  return chosen === 'light' || chosen === 'dark' ? chosen : null;
}

const systemTheme = (): Theme => (systemPrefersDark.matches ? 'dark' : 'light');

/** What the page shows: the person's choice, else the system's. */
export const theme = ref<Theme>(chosenTheme() ?? systemTheme());

systemPrefersDark.addEventListener('change', () => {
  if (!chosenTheme()) theme.value = systemTheme();
});

/** The browser's own bars take the page background, whichever theme won. */
function paintBrowserBars() {
  const background = getComputedStyle(document.body).backgroundColor;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute('content', background);
  }
}

if (chosenTheme()) paintBrowserBars();

/** An explicit choice outranks the system preference from now on. */
export function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  theme.value = next;
  paintBrowserBars();
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Storage is blocked, e.g. private browsing: the choice lasts this visit.
  }
}
