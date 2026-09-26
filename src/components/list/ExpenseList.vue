<script setup lang="ts">
import { confirmAction } from '@/confirm';
import { formatAmount, sumCents } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { hoveredDropZone } from './dragAndDrop';
import ExpensesWrapper from './ExpensesWrapper.vue';
import ExpenseCard from './ExpenseCard.vue';

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
  <div class="fr__groups">
    <section
      data-drop-category=""
      class="fr__group"
      :class="{ 'fr__drop-zone--hovered': hoveredDropZone === null }"
    >
      <h2 v-if="budget.categories.length" class="fr__group-heading">
        <span class="fr__group-name">Uncategorised</span>
        <span class="fr__amount">{{
          formatAmount(sumCents(budget.unassigned))
        }}</span>
      </h2>
      <p v-if="budget.expenses.length === 0" class="fr__empty">
        Nothing here yet. Add an expense above.
      </p>
      <ul class="fr__rows">
        <ExpenseCard
          v-for="expense in budget.unassigned"
          :key="expense.id"
          :expense="expense"
        />
      </ul>
    </section>
    <ExpensesWrapper
      v-for="category in budget.categories"
      :key="category"
      :category="category"
    />
    <button
      v-if="budget.expenses.length || budget.categories.length"
      type="button"
      class="fr__button--quiet-danger"
      @click="clearBudget"
    >
      Clear budget
    </button>
  </div>
</template>
