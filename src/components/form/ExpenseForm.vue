<template>
  <div>
    <form id="expenses-form" class="fr__form" @submit.prevent="addNewExpense()">
      <fieldset class="fr__label-wrapper">
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
        <div class="fr__label-wrapper">
          <label for="description">Description</label>
          <input
            id="description"
            v-model="Description"
            type="text"
            class="fr__input-box"
          />
        </div>
        <button form="expenses-form">Save Expense</button>
      </fieldset>
    </form>
    <form id="labels-form" class="fr__form" @submit.prevent="addNewLabel()">
      <fieldset class="fr__label-wrapper">
        <div class="fr__label-wrapper">
          <label for="expense">Category</label>
          <input id="label" v-model="Label" type="text" class="fr__input-box" />
        </div>
        <button form="labels-form">Save Category</button>
      </fieldset>
    </form>
    <form class="fr__form" @submit.prevent>
      <div
        class="fr__label-wrapper fr__label-wrapper--lean"
        v-if="!!labels.length"
      >
        <label for="removal-menu">Delete empty category </label>
        <select id="removal-menu" v-model="selected" @change="removeLabel()">
          <option value="" disabled>Select to delete</option>
          <option
            v-for="(label, index) in labels"
            :value="label"
            :key="index"
            :selected="false"
          >
            {{ label }}
          </option>
        </select>
      </div>
    </form>
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
    Description: '',
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
      this.Description = '';
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
        Description: this.Description,
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

      this.selected = '';
    },
  },
});
</script>
