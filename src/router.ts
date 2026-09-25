import { createRouter, createWebHistory } from 'vue-router';
import BudgetView from './views/BudgetView.vue';
import BudgetsView from './views/BudgetsView.vue';
import { useBudgetStore } from './stores/budget';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'budget', component: BudgetView },
    { path: '/budgets', name: 'budgets', component: BudgetsView },
    { path: '/:unknown(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const namesNoBudget = typeof to.query.budget !== 'string';
  if (to.name === 'budget' && namesNoBudget) {
    const budget = await useBudgetStore().defaultSlug();
    return { name: 'budget', query: { budget }, replace: true };
  }
});
