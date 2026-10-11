<script setup lang="ts">
import { ref } from 'vue';
import { AMOUNT_PATTERN, parseAmount } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { useMoneyStore } from '@/stores/money';
import { clearIfUnchanged } from './clearIfUnchanged';

const budget = useBudgetStore();
const money = useMoneyStore();

const name = ref('');
const amount = ref('');
const description = ref('');

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
</script>

<template>
  <form id="expenses-form" class="fr__stack" @submit.prevent="saveExpense">
    <div class="fr__field-row">
      <div class="fr__field">
        <label for="expense">Expense</label>
        <input id="expense" v-model="name" type="text" />
      </div>
      <div class="fr__field fr__field--amount">
        <label for="amount">
          Amount<template v-if="money.currency">
            ({{ money.currency }})</template
          >
        </label>
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
</template>
