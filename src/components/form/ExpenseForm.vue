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
            v-model="amount"
            type="text"
            inputmode="decimal"
            :pattern="AMOUNT_PATTERN"
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
