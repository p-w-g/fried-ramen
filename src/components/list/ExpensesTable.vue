<template>
  <table>
    <thead>
      <tr>
        <th>{{ label }}:</th>
        <th>
          <b>{{ labeledExpensesTotal }}</b>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(obj, index) in labeledExpenses"
        :key="index"
        :expense="obj.Expense"
      >
        <the-expense :obj="obj" />
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { expenseModel } from '@/models';
import store from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TheExpensesTable',
  props: {
    label: String
  },
  computed: {
    labeledExpensesTotal(): number {
      return;
    },
    labeledAmounts(): Array<number> {
      return this.labeledExpenses.map((e: expenseModel) => e.Amount);
    },
    labeledExpenses(): Array<expenseModel> {
      return store.state.allExpensesList.filter(
        (e: expenseModel) => e.Label === this.label
      );
    }
  }
});
</script>
