<template>
  <h2>{{ label }}: {{ labeledExpensesTotal }}</h2>
  <expense-card
    v-for="(expense, index) in labeledExpenses"
    :key="index"
    :expense="expense"
  />
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import { expenseModel } from '@/models';
import store from '@/store';
import { defineComponent } from 'vue';
import ExpenseCard from './ExpenseCard.vue';

export default defineComponent({
  name: 'ExpensesWrapper',

  components: {
    ExpenseCard,
  },

  props: {
    label: String,
  },

  computed: {
    labeledExpensesTotal(): number {
      return this.labeledAmounts.reduce(
        (accumulator: number, current: number) =>
          Number(accumulator) + Number(current),
        0
      );
    },

    labeledAmounts(): Array<number> {
      return this.labeledExpenses.map((e: expenseModel) => e.Amount);
    },

    labeledExpenses(): Array<expenseModel> {
      return store.state.allExpensesList.filter(
        (e: expenseModel) => e.Label === this.label
      );
    },
  },
});
</script>
