<template>
  <form id="expenses-form" class="fr__form" @submit.prevent="addNewExpense">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

export default defineComponent({
  data: () => ({
    Expense: '',
    Amount: 0
  }),
  methods: {
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
    }
  }
});
</script>
