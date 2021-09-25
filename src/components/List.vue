<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <form
          id="expenses-form"
          class="fr__form"
          @submit.prevent="addNewExpense"
        >
          <fieldset>
            <div class="fr__label-wrapper">
              <label for="expense">Expense</label>
              <input
                id="expense"
                v-model="Expense"
                type="text"
                class="fr__input-box"
              />
            </div>
            <div class="fr__label-wrapper">
              <label for="amount">Amount</label>
              <input
                id="amount"
                v-model.number="Amount"
                type="number"
                class="fr__input-box"
              />
            </div>
            <button />
          </fieldset>
        </form>
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
            :expense="obj.expense"
          >
            <td>
              <b>{{ obj.expense }}</b>
            </td>
            <td>
              {{ obj.amount }}
            </td>
            <td>
              <check-icon
                class="fr__button fr__button--expedite"
                @click="remove(obj.id)"
              />

              <chill-icon
                class="fr__button fr__button--postpone"
                @click="freeze(obj.id)"
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
              <revert-icon
                class="fr__button fr__button--advance"
                @click="advance(obj.Id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <flame-icon
        class="fr__button fr__button--advance"
        @click="removeAllTasks()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '../store/index';

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

  components: {},
  data: () => ({
    Expense: '',
    Amount: 0
  }),

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
    totalExpensesToggle() {
      return !(
        this.postponedExpenses.length < 1 || this.activeExpenses.length < 1
      );
    },
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    }
  },

  mounted() {
    store.dispatch('loadJsonAttemptAction');
  },

  methods: {
    // local state
    addNewExpense() {
      this.newObjectPush();
      this.resetForm();
      // return this.amount !== ''
      //   ? (this.newObjectPush(), this.resetForm())
      //   : null;
    },
    resetForm() {
      this.Expense = '';
      this.Amount = 0;
    },

    // store
    newObjectPush() {
      store.dispatch({
        type: 'addNewExpenseAction',
        Expense: this.Expense,
        Amount: this.Amount
      });
    },
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
