<template>
  <div>
    <form id="expenses-form" class="fr__form" @submit.prevent="addNewExpense()">
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
        <button form="expenses-form">add expense</button>
      </fieldset>
    </form>
    <form id="labels-form" class="fr__form" @submit.prevent="addNewLabel()">
      <fieldset>
        <div class="fr__label-wrapper">
          <label for="expense">Label</label>
          <input id="label" v-model="Label" type="text" class="fr__input-box" />
        </div>
        <button form="labels-form">add label</button>
      </fieldset>
    </form>
    <div class="fr__label-wrapper">
      <label for="removal-menu">Select to delete an empty label</label>
      <select id="removal-menu" v-model="selected" @change="removeLabel()">
        <option value="" disabled></option>
        <option v-for="(label, index) in labels" :value="label" :key="index">
          {{ label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

export default defineComponent({
  name: 'ExpenseForm',

  data: () => ({
    Expense: '',
    Amount: '',
    Label: '',
    selected: '',
  }),
  computed: {
    labels(): Array<string> {
      return store.getters.labels;
    },
  },
  methods: {
    addNewExpense() {
      this.newObjectPush();
      this.resetExpenseForm();
    },
    resetExpenseForm() {
      this.Expense = '';
      this.Amount = '';
    },
    addNewLabel() {
      this.newLabelPush();
      this.resetLabelForm();
    },
    resetLabelForm() {
      this.Label = '';
    },

    // store
    newObjectPush() {
      store.dispatch({
        type: 'addNewExpenseAction',
        Expense: this.Expense,
        Amount: this.Amount,
      });
    },
    newLabelPush() {
      store.dispatch({
        type: 'addNewLabelAction',
        Label: this.Label,
      });
    },
    removeLabel() {
      const Label = this.selected;

      store.dispatch({
        type: 'removeLabelAttemptAction',
        Label,
      });
    },
  },
});
</script>
