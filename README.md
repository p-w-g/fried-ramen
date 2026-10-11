# Fried Ramen

Budget planner and expense tracker: keep several budgets, sort their expenses into categories, and see where the money goes and how the total moved over time.

I know I should've called this app cup-ramen, because that's what students tend to eat when broke, but meh, felt fancy with frying the noodles afterwards.

https://fried-ramen.netlify.app/

## purpose

Stop buying random stuff, start buying useful stuff. A budget can be money already spent or money still planned, scoped to a month, a trip, a year, or whatever I need.

## what it does

- **Budgets**, each at its own path (`/budgets/<slug>`). On first start there's one called "Current".
- **Expenses** with an amount, an optional name and description. A blank amount counts as 0, so quick entries are fine. Amounts take a comma or a dot. Completing an expense takes it off the list and the current total, but the Trends history keeps it.
- **Categories**: drag expenses into them with a mouse or a finger. Each category shows its subtotal. They're added and deleted in their own section beside _Add expense_, and only an unused category can be deleted.
- **Charts**: _Overview_ is a donut of the total by category. _Trends_ draws the total over time, daily for the last 30 days or monthly for the last 12. The mini donut in the bottom bar opens them; from there the bottom bar and the budget's name in the top bar lead back to the budget, and only the logo leads to all budgets.
- **Settings** (the gear in the top bar), with two currency switches, **Converter** and **Budget currencies**. Both are off by default, and while both are off the app never talks to anything but itself.
- **Converter**, once switched on, behind the **Currency** icon in the top bar: an amount from one currency to another, with the rate and the day it was published. Rates come from [Frankfurter](https://frankfurter.dev), at most once a day per pair, and the last one keeps working offline.
- **Budget currencies**, once switched on: a budget can be in SEK, yen, złoty… picked when it's created or later on its page. That only labels its amounts, it never converts them, and switched off every budget reads as plain numbers again.
- **Show in** another currency, on a budget's page: each expense is converted for display only, and the total adds up the amounts as shown. Nothing converted is saved, amounts are still typed in the budget's own currency, and the charts stay in it.
- **Number format**, in settings: Auto follows the phone, or pick US, Swedish, German, Indian or Japanese. It decides how every amount is written (`47,55,330.50`, `300万`, `4 755 330,50`), and the converter reads amounts the same way, short words too: `300万`, `30L`, `1.5M`. The expense form keeps reading a comma or a dot as the decimal mark.
- **Light and dark theme**: follows the system until you pick one.
- **Installable and offline**: it's a PWA. When a new version is deployed, it asks before reloading.

### where the data lives

Only in the browser, in IndexedDB. There's no account and no server, so clearing site data or losing the phone loses the budgets. Settings has **Export backup** / **Import backup** (JSON). It shows when the last backup was made and warns when the browser hasn't promised to keep the data.

Totals over time come from **postings**: every change to a budget's total is recorded as a dated entry and never edited afterwards. Corrections become new postings, like in bookkeeping, so past days keep the totals they had. Only `src/postings.ts` and `src/backup.ts` may write postings, and lint enforces that.

## dev thingies

- `npm run dev`: local dev server
- `npm run build`: typecheck + production build (PWA, `service-worker.js`)
- `npm test`: unit tests (Vitest)
- `npm run test:e2e`: Playwright behaviour, axe and screenshot specs on the dev server (Pixel 7, plus iPad mini landscape and Galaxy Z Fold 8 unfolded for layout and screenshots). Offline, update, error and manifest checks run on the production build.
- `npm run lint` / `npm run format`
- `npm run check`: everything above. It runs as the git pre-push hook (installed by `npm install`)

Stack: Vue 3 + Pinia + Vue Router, Dexie over IndexedDB, Vite with `vite-plugin-pwa`. Hosted on Netlify (`public/_redirects` sends every path to the SPA).

### epic branches

Work that spans several features lands on one `epic/<name>` branch, merged into `master` as a single PR. Each feature still gets its own small commits, tagged by feature rather than by kind: `[feat-rates]`, `[feat-settings]` and so on, so `git log --grep` pulls one feature out of the epic.

Node 24 (`.nvmrc`). TypeScript stays on 6.0 until `vue-tsc` and `typescript-eslint` support TypeScript 7 (tsgo): TS 7 only exposes an unstable API, and both crash on it.
