<script setup lang="ts">
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();
</script>

<template>
  <nav class="fr__navbar">
    <RouterLink
      v-if="budget.budget"
      :to="{ name: 'budget', query: { budget: budget.budget.slug } }"
    >
      {{ budget.budget.name }}
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

  & > a.router-link-exact-active {
    color: var(--text);
    background: var(--accent-soft);
  }
}
</style>
