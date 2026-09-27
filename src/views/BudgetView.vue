<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpenseList from '@/components/list/ExpenseList.vue';
import BaseAccordion from '@/components/shared/BaseAccordion.vue';
import { formatAmount } from '@/domain';
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
  <div v-if="budget.status === 'open'" class="fr__page">
    <header class="fr__summary">
      <p class="fr__total">
        <span class="fr__total-label">Total</span>
        <span class="fr__amount">{{ formatAmount(budget.totalCents) }}</span>
      </p>
    </header>
    <BaseAccordion label="Add expense">
      <ExpenseForm />
    </BaseAccordion>
    <ExpenseList />
  </div>
  <div v-else-if="budget.status === 'missing'" class="fr__page">
    <h1>No such budget</h1>
    <p>There is no budget called “{{ route.params.slug }}”.</p>
    <RouterLink :to="{ name: 'budgets' }" class="fr__link-button">
      Go to budgets
    </RouterLink>
  </div>
</template>
