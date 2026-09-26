<script setup lang="ts">
import { ref } from 'vue';
import { confirmAction } from '@/confirm';
import type { Budget } from '@/domain';
import { BudgetNameError, useBudgetsStore } from '@/stores/budgets';

const { budget } = defineProps<{ budget: Budget }>();

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
  const confirmed = await confirmAction(
    `Delete “${budget.name}” and everything in it? This cannot be undone.`,
    'Delete',
  );
  if (confirmed) await budgets.remove(budget.id);
}
</script>

<template>
  <li class="fr__budget">
    <form
      v-if="draftName !== null"
      class="fr__stack"
      @submit.prevent="saveName"
    >
      <input
        v-model="draftName"
        type="text"
        :aria-label="`New name for ${budget.name}`"
      />
      <p v-if="problem" role="alert" class="fr__problem">{{ problem }}</p>
      <div class="fr__actions">
        <button type="button" @click="draftName = null">Cancel</button>
        <button class="fr__button--primary">Save name</button>
      </div>
    </form>
    <template v-else>
      <h3>
        <RouterLink
          :to="{ name: 'budget', query: { budget: budget.slug } }"
          :aria-label="`Open ${budget.name}`"
        >
          {{ budget.name }}
        </RouterLink>
      </h3>
      <button
        type="button"
        class="fr__button--quiet"
        @click="draftName = budget.name"
      >
        Rename
      </button>
      <button type="button" class="fr__button--quiet-danger" @click="remove">
        Delete
      </button>
    </template>
  </li>
</template>

<style>
.fr__budget {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;

  & + & {
    border-top: 1px solid var(--divider);
  }

  & > form {
    flex: 1;
    padding: 0.5rem 0.5rem 0.5rem 0;
  }

  & h3 {
    flex: 1;
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  & h3 a {
    color: var(--text);
    text-decoration: none;

    @media (hover: hover) {
      &:hover {
        color: var(--accent);
        text-decoration: underline;
      }
    }
  }
}
</style>
