<script setup lang="ts">
import { useBudgetStore } from '@/stores/budget';
import { droppedExpenseId } from './dragAndDrop';
import ExpensesWrapper from './ExpensesWrapper.vue';
import ExpenseCard from './ExpenseCard.vue';
import FlameIcon from '@/assets/icons/whatshot-24px.svg';

const budget = useBudgetStore();

function unassignDropped(event: DragEvent) {
  const id = droppedExpenseId(event);
  if (id !== null) budget.assignCategory(id, null);
}
</script>

<template>
  <div class="fr__content-column">
    <div @drop="unassignDropped" @dragenter.prevent @dragover.prevent>
      <h2>All: {{ budget.total }}</h2>
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
      @click="budget.clearEverything()"
    />
  </div>
</template>
