<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DonutChart from '@/components/charts/DonutChart.vue';
import { categoryShares } from '@/charts';
import { useBudgetStore } from '@/stores/budget';

const route = useRoute();
const budget = useBudgetStore();

const slices = computed(() => categoryShares(budget.expenses).slices);
/** The donut toggles: charts from the list, and back to the list from charts. */
const isOnCharts = computed(
  () => route.name === 'overview' || route.name === 'trends',
);
const slug = computed(() => String(route.params.slug));
</script>

<template>
  <nav class="fr__navbar">
    <RouterLink
      v-if="isOnCharts"
      :to="{ name: 'budget', params: { slug } }"
      class="fr__chart-toggle fr__chart-toggle--on"
      aria-label="Back to expenses"
    >
      <DonutChart :slices="slices" />
    </RouterLink>
    <RouterLink
      v-else
      :to="{ name: 'overview', params: { slug } }"
      class="fr__chart-toggle"
      aria-label="Charts"
    >
      <DonutChart :slices="slices" />
    </RouterLink>
    <RouterLink :to="{ name: 'budgets' }">Budgets</RouterLink>
  </nav>
</template>

<style>
.fr__navbar {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.5rem;
  position: sticky;
  bottom: 0;
  margin-top: 1.5rem;
  padding: 0.5rem 1rem calc(0.5rem + env(safe-area-inset-bottom));
  background-color: var(--surface);
  border-top: 1px solid var(--divider);

  & > a {
    display: grid;
    place-items: center;
    padding: 0.625rem 1rem;
    border-radius: var(--radius-control);
    color: var(--text-muted);
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > .fr__chart-toggle--on {
    background: var(--accent-soft);
  }
}

.fr__chart-toggle .fr__donut {
  width: 1.5rem;
  height: 1.5rem;

  & circle {
    stroke-width: 20;
  }
}
</style>
