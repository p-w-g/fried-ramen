<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { AMOUNT_PATTERN, parseAmount } from '@/domain';
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();

const name = ref('');
const amount = ref('');
const description = ref('');
const category = ref('');

/**
 * Clears a field once its save landed, so a failure keeps what was typed,
 * and only if it still holds what was sent, so a next entry typed while
 * the save was in flight survives.
 */
function clearIfUnchanged(field: Ref<string>, sent: string) {
  if (field.value === sent) field.value = '';
}

async function saveExpense() {
  const sent = {
    name: name.value,
    amount: amount.value,
    description: description.value,
  };
  const parsed = parseAmount(sent.amount);
  if (parsed === null) return; // the pattern attribute already told them
  await budget.addExpense({
    name: sent.name,
    amount: parsed,
    description: sent.description,
  });
  clearIfUnchanged(name, sent.name);
  clearIfUnchanged(amount, sent.amount);
  clearIfUnchanged(description, sent.description);
}

async function saveCategory() {
  const sent = category.value;
  await budget.addCategory(sent);
  clearIfUnchanged(category, sent);
}

async function deleteCategory(event: Event) {
  const select = event.target as HTMLSelectElement;
  await budget.deleteCategoryIfEmpty(select.value);
  select.value = '';
}
</script>

<template>
  <form id="expenses-form" class="fr__stack" @submit.prevent="saveExpense">
    <div class="fr__field-row">
      <div class="fr__field">
        <label for="expense">Expense</label>
        <input id="expense" v-model="name" type="text" />
      </div>
      <div class="fr__field fr__field--amount">
        <label for="amount">Amount</label>
        <input
          id="amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :pattern="AMOUNT_PATTERN"
        />
      </div>
    </div>
    <div class="fr__field">
      <label for="description">Description</label>
      <input id="description" v-model="description" type="text" />
    </div>
    <button form="expenses-form" class="fr__button--primary">
      Save expense
    </button>
  </form>

  <h2 class="fr__subheading">Categories</h2>
  <form id="labels-form" class="fr__field-row" @submit.prevent="saveCategory">
    <div class="fr__field">
      <label for="label">New category</label>
      <input id="label" v-model="category" type="text" />
    </div>
    <button form="labels-form">Add</button>
  </form>
  <div v-if="budget.categories.length" class="fr__field">
    <label for="removal-menu">Delete an empty category</label>
    <select id="removal-menu" @change="deleteCategory">
      <option value="" disabled selected>Choose one</option>
      <option
        v-for="existing in budget.categories"
        :key="existing"
        :value="existing"
      >
        {{ existing }}
      </option>
    </select>
  </div>
</template>
