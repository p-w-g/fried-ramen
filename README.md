# Fried Ramen

Budget planner and expense tracker: keep several budgets, sort their expenses into categories, and see where the money goes and how the total moved over time.

I know I should've called this app cup-ramen, because that's what students tend to eat when broke, but meh, felt fancy with frying the noodles afterwards.

https://fried-ramen.netlify.app/

## purpose

Stop buying random stuff, start buying useful stuff. A budget can be money already spent or money still planned, scoped to a month, a trip, a year, or whatever I need.

## what it does

- **Budgets**, each at its own path (`/budgets/<slug>`). On first start there's one called "Current".
- **Expenses** with an amount, an optional name and description. A blank amount counts as 0, so quick entries are fine. Amounts take a comma or a dot. Completing an expense takes it off the list and the current total, but the Trends history keeps it.
- **Categories**: drag expenses into them with a mouse or a finger. Each category shows its subtotal.
- **Charts**: _Overview_ is a donut of the total by category. _Trends_ draws the total over time, daily for the last 30 days or monthly for the last 12.
- **Light and dark theme**: follows the system until you pick one.
- **Installable and offline**: it's a PWA. When a new version is deployed, it asks before reloading.

### where the data lives

Only in the browser, in IndexedDB. There's no account and no server, so clearing site data or losing the phone loses the budgets. The budgets page has **Export backup** / **Import backup** (JSON). It shows when the last backup was made and warns when the browser hasn't promised to keep the data.

Totals over time come from **postings**: every change to a budget's total is recorded as a dated entry and never edited afterwards. Corrections become new postings, like in bookkeeping, so past days keep the totals they had. Only `src/postings.ts` and `src/backup.ts` may write postings, and lint enforces that.

## dev thingies

- `npm run dev`: local dev server
- `npm run build`: typecheck + production build (PWA, `service-worker.js`)
- `npm test`: unit tests (Vitest)
- `npm run test:e2e`: Playwright behaviour, axe and screenshot specs on the dev server (Pixel 7, plus iPad mini landscape and Galaxy Z Fold 8 unfolded for layout and screenshots). Offline, update, error and manifest checks run on the production build.
- `npm run lint` / `npm run format`
- `npm run check`: everything above. It runs as the git pre-push hook (installed by `npm install`)

Stack: Vue 3 + Pinia + Vue Router, Dexie over IndexedDB, Vite with `vite-plugin-pwa`. Hosted on Netlify (`public/_redirects` sends every path to the SPA).

Node 24 (`.nvmrc`). TypeScript stays on 6.0 until `vue-tsc` and `typescript-eslint` support TypeScript 7 (tsgo): TS 7 only exposes an unstable API, and both crash on it.
