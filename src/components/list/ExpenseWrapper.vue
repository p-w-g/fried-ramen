<template>
  <div class="fr__content-column">
    <table>
      <thead>
        <tr>
          <th>All:</th>
          <th>
            <b>{{ totalExpenses }}</b>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(obj, index) in unassignedExpenses"
          :key="index"
          :expense="obj.Expense"
        >
          <the-expense :obj="obj" />
        </tr>
      </tbody>
    </table>
    <the-expenses-table
      v-for="(label, index) in labels"
      :label="label"
      :key="index"
    />
    <img
      :src="FlameIcon"
      class="fr__button fr__button--advance"
      @click="removeAllTasks()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';
// eslint-disable-next-line no-unused-vars
import { expenseModel } from '@/models';

import TheExpense from '@/components/list/Expense.vue';
import TheExpensesTable from '@/components/list/ExpensesTable.vue';
import FlameIcon from '@/assets/icons/whatshot-24px.svg';

export default defineComponent({
  name: 'TheExpenseList',

  setup() {
    return {
      FlameIcon
    };
  },

  components: {
    TheExpense,
    TheExpensesTable
  },

  computed: {
    totalExpenses(): number {
      return store.getters.totalTotal;
    },
    labels(): Array<string> {
      return store.getters.labels;
    },
    unassignedExpenses(): Array<expenseModel> {
      return store.getters.filterUnassigned;
    },

    postponedExpensesTotal(): number {
      return store.getters.frozenTotal;
    },
    postponedExpenses(): number {
      return store.getters.filterFrozen;
    },
    activeExpensesTotal(): number {
      return store.getters.activeTotal;
    },
    activeExpenses(): number {
      return store.getters.filterActive;
    }
  },

  mounted() {
    store.dispatch('loadJsonAttemptAction');
  },

  methods: {
    removeAllTasks() {
      store.dispatch('removeAllTasksAction');
    }
  }
});
</script>
