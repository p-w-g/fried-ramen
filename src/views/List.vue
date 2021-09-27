<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <the-expense-form />
      </header>
    </div>

    <div class="fr__content-column">
      <table>
        <thead>
          <tr>
            <th>Active:</th>
            <th>
              <b>{{ activeExpensesTotal }}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(obj, index) in activeExpenses"
            :key="index"
            :expense="obj.Expense"
          >
            <td>
              <b>{{ obj.Expense }}</b>
            </td>
            <td>
              {{ obj.Amount }}
            </td>
            <td>
              <img
                :src="CheckIcon"
                class="fr__button fr__button--expedite"
                @click="remove(obj.Id)"
              />

              <img
                :src="ChillIcon"
                class="fr__button fr__button--postpone"
                @click="freeze(obj.Id)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Postponed:</th>
            <th>
              <b>{{ postponedExpensesTotal }}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(obj, index) in postponedExpenses"
            :key="index"
            :expense="obj.Expense"
          >
            <td>
              <b>{{ obj.Expense }}</b>
            </td>
            <td>
              {{ obj.Amount }}
            </td>
            <td>
              <img
                :src="RevertIcon"
                class="fr__button fr__button--advance"
                @click="advance(obj.Id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <img
        :src="FlameIcon"
        class="fr__button fr__button--advance"
        @click="removeAllTasks()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '../store/index';

import TheExpenseForm from '@/components/form/ExpenseForm.vue';

import FlameIcon from '../assets/icons/whatshot-24px.svg';
import RevertIcon from '../assets/icons/history-24px.svg';
import ChillIcon from '../assets/icons/ac_unit-24px.svg';
import CheckIcon from '../assets/icons/check_circle_outline-24px.svg';

const themNomNoms = [
  'Am famished.',
  'Coffee run.',
  'Burgers it is.',
  'Pizza Time'
];

export default defineComponent({
  name: 'ExpenseList',

  setup() {
    return {
      FlameIcon,
      RevertIcon,
      ChillIcon,
      CheckIcon
    };
  },

  components: { TheExpenseForm },

  computed: {
    totalExpenses(): number {
      return store.getters.totalTotal;
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
    },
    // totalExpensesToggle() {
    //   return !(
    //     this.postponedExpenses.length < 1 || this.activeExpenses.length < 1
    //   );
    // },
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    }
  },

  mounted() {
    store.dispatch('loadJsonAttemptAction');
  },

  methods: {
    freeze(index: number) {
      store.dispatch({
        type: 'freezeThisExpenseAction',
        index
      });
    },
    advance(index: number) {
      store.dispatch({
        type: 'advanceThisExpenseAction',
        index
      });
    },
    remove(index: number) {
      store.dispatch({
        type: 'removeThisTaskAction',
        index
      });
    },
    saveExpenseList() {
      store.dispatch('saveToLocalStorageAction');
    },
    removeAllTasks() {
      store.dispatch('removeAllTasksAction');
    }
  }
});
</script>
