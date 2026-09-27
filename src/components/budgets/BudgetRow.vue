<script setup lang="ts">
import { ref } from 'vue';
import { confirmAction } from '@/confirm';
import AppIcon from '@/components/shared/AppIcon.vue';
import { formatAmount, formatCompactAmount, type Budget } from '@/domain';
import { BudgetNameError, useBudgetsStore } from '@/stores/budgets';
import MoreIcon from '@/assets/icons/more_horiz.svg';

const { budget } = defineProps<{ budget: Budget }>();

const budgets = useBudgetsStore();

/** Ties this row's menu to its own button; ids are unique per budget. */
const menuId = `budget-menu-${budget.id}`;
const anchor = `--budget-${budget.id}`;

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
          :to="{ name: 'budget', params: { slug: budget.slug } }"
          :aria-label="`Open ${budget.name}`"
          class="fr__budget-link"
        >
          {{ budget.name }}
        </RouterLink>
      </h3>
      <p class="fr__budget-total fr__amount">
        <span aria-hidden="true">
          {{ formatCompactAmount(budgets.totalOf(budget.id)) }}
        </span>
        <span class="fr__visually-hidden">
          Total {{ formatAmount(budgets.totalOf(budget.id)) }}
        </span>
      </p>
      <button
        type="button"
        class="fr__icon-button fr__budget-menu-button"
        :popovertarget="menuId"
        :aria-label="`More for ${budget.name}`"
        :style="{ anchorName: anchor }"
      >
        <AppIcon :src="MoreIcon" />
      </button>
      <div
        :id="menuId"
        popover
        class="fr__menu"
        :style="{ positionAnchor: anchor }"
      >
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
      </div>
    </template>
  </li>
</template>

<style>
.fr__budget {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  min-height: 3.5rem;

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

  & .fr__budget-total {
    margin: 0 0.25rem 0 0;
    font-weight: 600;
  }

  & .fr__budget-link {
    color: var(--text);
    text-decoration: none;

    /* Stretches the link over the whole row, so a tap anywhere opens it. */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  }

  @media (hover: hover) {
    &:has(.fr__budget-link:hover) {
      background: var(--accent-soft);
    }
  }

  &:has(.fr__budget-link:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: -2px;

    & .fr__budget-link {
      outline: none;
    }
  }

  /* Above the stretched link, so the menu button stays its own target. */
  & .fr__budget-menu-button {
    position: relative;
  }
}

.fr__menu {
  flex-direction: column;
  min-width: 9rem;
  padding: 0.25rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--divider);
  border-radius: var(--radius-container);
  box-shadow: var(--shadow-float);

  &:popover-open {
    display: flex;
  }

  & button {
    justify-content: flex-start;
    text-align: left;
  }

  & .fr__button--quiet {
    color: var(--text);
  }
}

/* Without anchor positioning the menu stays centered, as popovers default. */
@supports (position-area: bottom) {
  .fr__menu {
    inset: auto;
    margin: 0.25rem 0;
    position-area: bottom span-left;
    position-try-fallbacks: flip-block;
  }
}
</style>
