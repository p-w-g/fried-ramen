<script setup lang="ts">
import { ref } from 'vue';
import type { Budget } from '@/domain';
import { BudgetNameError, useBudgetsStore } from '@/stores/budgets';

const { budget, isOnlyBudget } = defineProps<{
  budget: Budget;
  isOnlyBudget: boolean;
}>();

const budgets = useBudgetsStore();

/** Only exists while renaming, copied from the current name. */
const draftName = ref<string | null>(null);
const problem = ref('');

async function saveName() {
  if (draftName.value === null) return;
  try {
    await budgets.rename(budget.id, draftName.value);
    draftName.value = null;
    problem.value = '';
  } catch (error) {
    if (!(error instanceof BudgetNameError)) throw error;
    problem.value = error.message;
  }
}

async function remove() {
  const confirmed = confirm(
    `Delete “${budget.name}” and everything in it? This cannot be undone.`,
  );
  if (confirmed) await budgets.remove(budget.id);
}
</script>

<template>
  <div class="fr__card fr__budget">
    <form v-if="draftName !== null" @submit.prevent="saveName">
      <input
        v-model="draftName"
        type="text"
        class="fr__input-box"
        :aria-label="`New name for ${budget.name}`"
      />
      <p v-if="problem" role="alert">{{ problem }}</p>
      <button>Save name</button>
      <button type="button" @click="draftName = null">Cancel</button>
    </form>
    <template v-else>
      <h3>{{ budget.name }}</h3>
      <RouterLink
        :to="{ name: 'budget', query: { budget: budget.slug } }"
        class="fr__link-button"
        :aria-label="`Open ${budget.name}`"
      >
        Open
      </RouterLink>
      <button type="button" @click="draftName = budget.name">Rename</button>
      <button
        type="button"
        :disabled="isOnlyBudget"
        :title="isOnlyBudget ? 'The last budget cannot be deleted' : undefined"
        @click="remove"
      >
        Delete
      </button>
    </template>
  </div>
</template>

<style>
.fr__budget {
  width: auto;
  padding-bottom: 0.5rem;

  & h3 {
    margin: 0.75rem 0 0;
  }

  & button,
  & .fr__link-button {
    margin: 0.5rem 0.25rem 0;
  }
}
</style>
