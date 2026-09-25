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
  display: flex;
  position: sticky;
  bottom: 0;
  margin-top: 1em;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: var(--radius) var(--radius) 0 0;
  background-color: white;
  box-shadow: var(--glass-shadow);

  & > a {
    flex: 1 1 0;
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    background: var(--glass-green);
    color: var(--text);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > a.router-link-exact-active {
    background: var(--glass-steel);
  }
}
</style>
