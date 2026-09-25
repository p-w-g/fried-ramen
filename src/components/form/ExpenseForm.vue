<script setup lang="ts">
import { ref } from 'vue';
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();

const name = ref('');
const amount = ref<number | ''>('');
const description = ref('');
const category = ref('');

function saveExpense() {
  budget.addExpense({
    name: name.value,
    amount: Number(amount.value) || 0,
    description: description.value,
  });
  name.value = '';
  amount.value = '';
  description.value = '';
}

function saveCategory() {
  budget.addCategory(category.value);
  category.value = '';
}

function deleteCategory(event: Event) {
  const select = event.target as HTMLSelectElement;
  budget.deleteCategoryIfEmpty(select.value);
  select.value = '';
}
</script>

<template>
  <div>
    <form id="expenses-form" class="fr__form" @submit.prevent="saveExpense">
      <fieldset class="fr__label-wrapper">
        <div class="fr__label-wrapper">
          <label for="expense">Expense</label>
          <input
            id="expense"
            v-model="name"
            type="text"
            class="fr__input-box"
          />
        </div>
        <div class="fr__label-wrapper">
          <label for="amount">Amount</label>
          <input
            id="amount"
            v-model.number="amount"
            type="number"
            step="0.01"
            class="fr__input-box"
          />
        </div>
        <div class="fr__label-wrapper">
          <label for="description">Description</label>
          <input
            id="description"
            v-model="description"
            type="text"
            class="fr__input-box"
          />
        </div>
        <button form="expenses-form">Save Expense</button>
      </fieldset>
    </form>
    <form id="labels-form" class="fr__form" @submit.prevent="saveCategory">
      <fieldset class="fr__label-wrapper">
        <div class="fr__label-wrapper">
          <label for="label">Category</label>
          <input
            id="label"
            v-model="category"
            type="text"
            class="fr__input-box"
          />
        </div>
        <button form="labels-form">Save Category</button>
      </fieldset>
    </form>
    <form v-if="budget.categories.length" class="fr__form" @submit.prevent>
      <div class="fr__label-wrapper fr__label-wrapper--lean">
        <label for="removal-menu">Delete empty category </label>
        <select id="removal-menu" @change="deleteCategory">
          <option value="" disabled selected>Select to delete</option>
          <option
            v-for="existing in budget.categories"
            :key="existing"
            :value="existing"
          >
            {{ existing }}
          </option>
        </select>
      </div>
    </form>
  </div>
</template>
