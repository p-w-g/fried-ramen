<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetStore } from '@/stores/budget';

const route = useRoute();
const budget = useBudgetStore();

watch(
  () => route.params.slug,
  (slug) => {
    if (typeof slug === 'string') void budget.open(slug);
  },
  { immediate: true },
);
</script>

<template>
  <RouterView v-if="budget.status === 'open'" />
  <div v-else-if="budget.status === 'missing'" class="fr__page">
    <h1>No such budget</h1>
    <p>There is no budget called “{{ route.params.slug }}”.</p>
    <RouterLink :to="{ name: 'budgets' }" class="fr__link-button">
      Go to budgets
    </RouterLink>
  </div>
</template>
