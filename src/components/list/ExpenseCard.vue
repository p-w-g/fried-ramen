<script setup lang="ts">
import { ref } from 'vue';
import {
  AMOUNT_PATTERN,
  formatAmount,
  fromCents,
  parseAmount,
  type Expense,
  type ExpenseDraft,
} from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { useDragToCategory } from './dragAndDrop';
import AppIcon from '@/components/shared/AppIcon.vue';
import CheckIcon from '@/assets/icons/check_circle_outline-24px.svg';
import EditIcon from '@/assets/icons/edit_square.svg';
import SaveIcon from '@/assets/icons/save_as.svg';

const { expense } = defineProps<{ expense: Expense }>();

const budget = useBudgetStore();

/** What assistive tech calls this expense; quick entries have no name yet. */
const label = () => expense.name || 'unnamed expense';

/** Only exists while editing, and is always copied from the current expense. */
const draft = ref<(Omit<ExpenseDraft, 'amount'> & { amount: string }) | null>(
  null,
);

function startEditing() {
  draft.value = {
    name: expense.name,
    amount: String(fromCents(expense.amountCents)),
    description: expense.description,
  };
}

async function saveEdit() {
  if (!draft.value) return;
  const amount = parseAmount(draft.value.amount);
  if (amount === null) return; // stay in edit mode until the amount reads
  await budget.updateExpense(expense.id, { ...draft.value, amount });
  draft.value = null;
}

async function selectCategory(event: Event) {
  const category = (event.target as HTMLSelectElement).value;
  await budget.assignCategory(expense.id, category || null);
}

const drag = useDragToCategory((category) =>
  budget.assignCategory(expense.id, category),
);

function startDrag(event: PointerEvent) {
  if (!draft.value) drag.onPointerDown(event);
}
</script>

<template>
  <li
    class="fr__entry"
    :class="{
      'fr__entry--edit-mode': draft,
      'fr__entry--dragging': drag.isDragging.value,
    }"
    :style="
      drag.isDragging.value
        ? `transform: translate(${drag.offset.x}px, ${drag.offset.y}px)`
        : undefined
    "
    @pointerdown="startDrag"
  >
    <template v-if="draft">
      <input
        v-model="draft.name"
        :placeholder="expense.name"
        :aria-label="`Name of ${label()}`"
        type="text"
        class="fr__entry-name"
      />
      <input
        v-model="draft.amount"
        :placeholder="String(fromCents(expense.amountCents))"
        :aria-label="`Amount of ${label()}`"
        type="text"
        inputmode="decimal"
        :pattern="AMOUNT_PATTERN"
        class="fr__entry-amount"
      />
      <input
        v-model="draft.description"
        :placeholder="expense.description"
        :aria-label="`Description of ${label()}`"
        type="text"
        class="fr__entry-description"
      />
    </template>
    <template v-else>
      <h3
        class="fr__entry-name"
        :class="{ 'fr__entry-name--unnamed': !expense.name }"
      >
        {{ expense.name || 'Unnamed expense' }}
      </h3>
      <span class="fr__entry-amount fr__amount">
        {{ formatAmount(expense.amountCents) }}
      </span>
      <p v-if="expense.description" class="fr__entry-description">
        {{ expense.description }}
      </p>
    </template>
    <div class="fr__entry-actions">
      <select
        v-if="budget.categories.length"
        :value="expense.category ?? ''"
        :aria-label="`Category of ${label()}`"
        @change="selectCategory"
      >
        <option value="">No category</option>
        <option v-for="name in budget.categories" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
      <button
        v-if="draft"
        type="button"
        class="fr__icon-button"
        :aria-label="`Save ${label()}`"
        @click="saveEdit"
      >
        <AppIcon :src="SaveIcon" />
      </button>
      <template v-else>
        <button
          type="button"
          class="fr__icon-button"
          :aria-label="`Edit ${label()}`"
          @click="startEditing"
        >
          <AppIcon :src="EditIcon" />
        </button>
        <button
          type="button"
          class="fr__icon-button"
          :aria-label="`Complete ${label()}`"
          @click="budget.completeExpense(expense.id)"
        >
          <AppIcon :src="CheckIcon" />
        </button>
      </template>
    </div>
  </li>
</template>

<style>
/* The name spans over the actions' column, so wide actions never squeeze it. */
.fr__entry {
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-areas:
    'name name amount'
    'description actions actions';
  align-items: center;
  gap: 0 0.75rem;
  padding: 0.75rem 1rem 0.5rem;
  background: var(--surface);

  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;

  & + & {
    border-top: 1px solid var(--divider);
  }

  &.fr__entry--edit-mode {
    gap: 0.5rem 0.75rem;
    background: var(--accent-soft);
    -webkit-user-select: auto;
    user-select: auto;
  }

  &.fr__entry--dragging {
    position: relative;
    z-index: 1;
    pointer-events: none;
    opacity: 0.9;
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-float);
  }
}

.fr__entry-name {
  grid-area: name;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  min-width: 0;
  overflow-wrap: anywhere;

  &.fr__entry-name--unnamed {
    color: var(--text-muted);
    font-style: italic;
    font-weight: 400;
  }
}

.fr__entry-amount {
  grid-area: amount;
  justify-self: end;
  font-weight: 600;
}

input.fr__entry-amount {
  width: 6.5rem;
  text-align: right;
}

.fr__entry-description {
  grid-area: description;
  margin: 0;
  min-width: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}

.fr__entry-actions {
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;

  & select {
    max-width: 8.5rem;
    min-height: 2.25rem;
    padding-block: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-muted);
  }
}
</style>
