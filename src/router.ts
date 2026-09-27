import { createRouter, createWebHistory } from 'vue-router';
import BudgetView from './views/BudgetView.vue';
import BudgetsView from './views/BudgetsView.vue';
import { useBudgetStore } from './stores/budget';
import { runFirstStart } from './stores/firstStart';

/** "/" only ever redirects, so it never gets to render anything. */
const Redirecting = { render: () => null };

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Redirecting },
    { path: '/budgets', name: 'budgets', component: BudgetsView },
    { path: '/budgets/:slug', name: 'budget', component: BudgetView },
    { path: '/:unknown(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  await runFirstStart();
  if (to.name !== 'home') return;

  // Bookmarks and home screen shortcuts from before budgets had paths.
  const legacySlug = to.query.budget;
  const slug =
    typeof legacySlug === 'string'
      ? legacySlug
      : await useBudgetStore().defaultSlug();
  if (slug === null) return { name: 'budgets', replace: true };
  return { name: 'budget', params: { slug }, replace: true };
});
