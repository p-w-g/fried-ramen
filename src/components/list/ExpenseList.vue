<script setup lang="ts">
import { confirmAction } from '@/confirm';
import { fromCents } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { hoveredDropZone } from './dragAndDrop';
import ExpensesWrapper from './ExpensesWrapper.vue';
import ExpenseCard from './ExpenseCard.vue';
import AppIcon from '@/components/shared/AppIcon.vue';
import FlameIcon from '@/assets/icons/whatshot-24px.svg';

const budget = useBudgetStore();

async function clearBudget() {
  const name = budget.budget?.name ?? 'this budget';
  const confirmed = await confirmAction(
    `Clear every expense and category in “${name}”?`,
    'Clear',
  );
  if (confirmed) {
    await budget.clearBudget();
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
    <button
      type="button"
      class="fr__icon-button"
      :aria-label="`Clear ${budget.budget?.name ?? 'this budget'}`"
      @click="clearBudget"
    >
      <AppIcon :src="FlameIcon" />
    </button>
  </div>
</template>
