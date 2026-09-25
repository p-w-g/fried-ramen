<script setup lang="ts">
import { ref } from 'vue';
import {
  AMOUNT_PATTERN,
  fromCents,
  parseAmount,
  type Expense,
  type ExpenseDraft,
} from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { useDragToCategory } from './dragAndDrop';
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

function saveEdit() {
  if (!draft.value) return;
  const amount = parseAmount(draft.value.amount);
  if (amount === null) return; // stay in edit mode until the amount reads
  budget.updateExpense(expense.id, { ...draft.value, amount });
  draft.value = null;
}

function selectCategory(event: Event) {
  const category = (event.target as HTMLSelectElement).value;
  budget.assignCategory(expense.id, category || null);
}

const drag = useDragToCategory((category) =>
  budget.assignCategory(expense.id, category),
);

function startDrag(event: PointerEvent) {
  if (!draft.value) drag.onPointerDown(event);
}
</script>

<template>
  <div
    class="fr__card"
    :class="{
      'fr__card--edit-mode': draft,
      'fr__card--dragging': drag.isDragging.value,
    }"
    :style="
      drag.isDragging.value
        ? `transform: translate(${drag.offset.x}px, ${drag.offset.y}px)`
        : undefined
    "
    @pointerdown="startDrag"
  >
    <div v-if="draft" class="fr__card-header">
      <input
        v-model="draft.name"
        :placeholder="expense.name"
        :aria-label="`Name of ${label()}`"
        type="text"
        class="fr__input-box"
      />
      <input
        v-model="draft.amount"
        :placeholder="String(fromCents(expense.amountCents))"
        :aria-label="`Amount of ${label()}`"
        type="text"
        inputmode="decimal"
        :pattern="AMOUNT_PATTERN"
        class="fr__input-box"
      />
    </div>
    <div v-else class="fr__card-header">
      <h3 v-if="expense.name">{{ expense.name }}</h3>
      <h3 v-else><span class="fr__visually-hidden">Unnamed expense</span></h3>
      <h4>{{ fromCents(expense.amountCents) }}</h4>
    </div>
    <div
      class="fr__card-body"
      :class="{ 'fr__card-body--no-desc': !expense.description }"
    >
      <p v-if="expense.description && !draft">
        {{ expense.description }}
      </p>
      <input
        v-if="draft"
        v-model="draft.description"
        :placeholder="expense.description"
        :aria-label="`Description of ${label()}`"
        type="text"
        class="fr__input-box"
      />
      <ul class="fr__card-options">
        <li>
          <button
            v-if="!draft"
            type="button"
            class="fr__icon-button"
            :aria-label="`Complete ${label()}`"
            @click="budget.completeExpense(expense.id)"
          >
            <img :src="CheckIcon" alt="" class="fr__button" />
          </button>
        </li>
        <li v-if="!draft">
          <button
            type="button"
            class="fr__icon-button"
            :aria-label="`Edit ${label()}`"
            @click="startEditing"
          >
            <img :src="EditIcon" alt="" class="fr__button" />
          </button>
        </li>
        <li v-if="draft">
          <button
            type="button"
            class="fr__icon-button"
            :aria-label="`Save ${label()}`"
            @click="saveEdit"
          >
            <img :src="SaveIcon" alt="" class="fr__button" />
          </button>
        </li>
        <li>
          <select
            :value="expense.category ?? ''"
            :aria-label="`Category of ${label()}`"
            @change="selectCategory"
          >
            <option value=""></option>
            <option v-for="name in budget.categories" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.fr__card {
  /* From https://css.glass */
  background: rgba(210, 221, 239, 0.3);
  border-radius: var(--radius);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: var(--glass-border);
  padding: 0 1rem;
  margin: 1rem;

  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;

  &.fr__card--edit-mode {
    background: var(--glass-steel);
    -webkit-user-select: auto;
    user-select: auto;
  }

  &.fr__card--dragging {
    position: relative;
    z-index: 1;
    pointer-events: none;
    opacity: 0.85;
    box-shadow: var(--glass-shadow);
  }
}

.fr__card-options {
  margin-top: 5px;
  margin-bottom: 5px;
}

.fr__card-header {
  & > h3,
  & > h4 {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  & > input {
    margin: 5px;
  }
}

.fr__card-header,
.fr__card-body {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.fr__card-body--no-desc {
  justify-content: flex-end;
}
</style>
