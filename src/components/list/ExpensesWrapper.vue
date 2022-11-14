<template>
  <div @drop="dropCard($event, label)" @dragenter.prevent @dragover.prevent>
    <h2>{{ label }}: {{ labeledExpensesTotal }}</h2>
    <expense-card
      v-for="(expense, index) in labeledExpenses"
      :key="index"
      :expense="expense"
      draggable="true"
      @dragstart="pullCard($event, expense)"
    />
  </div>
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

  methods: {
    pullCard(event: DragEvent, card: expenseModel) {
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('cardID', card.Id.toString());
    },

    dropCard(event: DragEvent, label: string) {
      const Id = parseInt(event.dataTransfer.getData('cardID'), 10);
      const Label = label;
      store.dispatch({
        type: 'labelThisExpenseAction',
        Id,
        Label,
      });
    },
  },
});
</script>
