<script setup lang="ts">
import { fromCents } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { hoveredDropZone } from './dragAndDrop';
import ExpensesWrapper from './ExpensesWrapper.vue';
import ExpenseCard from './ExpenseCard.vue';
import FlameIcon from '@/assets/icons/whatshot-24px.svg';

const budget = useBudgetStore();

function clearBudget() {
  const name = budget.budget?.name ?? 'this budget';
  if (confirm(`Clear every expense and category in “${name}”?`)) {
    budget.clearBudget();
  }
}
</script>

<template>
  <div class="fr__content-column">
    <div
      data-drop-category=""
      :class="{ 'fr__drop-zone--hovered': hoveredDropZone === null }"
    >
      <h2>All: {{ fromCents(budget.totalCents) }}</h2>
      <ExpenseCard
        v-for="expense in budget.unassigned"
        :key="expense.id"
        :expense="expense"
      />
    </div>
    <ExpensesWrapper
      v-for="category in budget.categories"
      :key="category"
      :category="category"
    />
    <img
      :src="FlameIcon"
      class="fr__button fr__button--advance"
      @click="clearBudget"
    />
  </div>
</template>
