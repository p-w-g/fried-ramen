<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import {
  CURRENCIES,
  GROUPED_AMOUNT_PATTERN,
  caretAfterTyped,
  convertCents,
  formatMoney,
  groupThousands,
  parseAmount,
  toCents,
  type Currency,
  type Rate,
} from '@/domain';
import { useLeave } from '@/leave';
import { getRate } from '@/rates';

const leave = useLeave();
const typed = ref('');
const from = ref<Currency>('SEK');
const to = ref<Currency>('EUR');
const rate = shallowRef<Rate | null>(null);
const isFetching = ref(true);

watch(
  [from, to],
  async ([base, quote]) => {
    isFetching.value = true;
    const found = await getRate(base, quote);
    const isStillWanted = base === from.value && quote === to.value;
    if (!isStillWanted) return; // a newer pair took over meanwhile
    rate.value = found;
    isFetching.value = false;
  },
  { immediate: true },
);

/** Regroups as they type, keeping the caret by the digit it was next to. */
function regroup(event: Event) {
  const input = event.target as HTMLInputElement;
  const caret = input.selectionStart ?? input.value.length;
  const typedBeforeCaret = input.value.slice(0, caret).replaceAll(' ', '');
  const grouped = groupThousands(input.value);
  typed.value = grouped;
  input.value = grouped;
  const at = caretAfterTyped(grouped, typedBeforeCaret.length);
  input.setSelectionRange(at, at);
}

function swap() {
  [from.value, to.value] = [to.value, from.value];
}

const amountCents = computed(() => {
  const amount = parseAmount(typed.value.replaceAll(' ', ''));
  return amount === null ? null : toCents(amount);
});

const converted = computed(() =>
  rate.value && amountCents.value !== null
    ? formatMoney(convertCents(amountCents.value, rate.value), to.value)
    : null,
);
</script>

<template>
  <div class="fr__page">
    <h1>Currency</h1>
    <form class="fr__stack" @submit.prevent>
      <div class="fr__field">
        <label for="convert-amount">Amount</label>
        <input
          id="convert-amount"
          :value="typed"
          type="text"
          inputmode="decimal"
          :pattern="GROUPED_AMOUNT_PATTERN"
          @input="regroup"
        />
      </div>
      <div class="fr__field-row">
        <div class="fr__field">
          <label for="convert-from">From</label>
          <select id="convert-from" v-model="from">
            <option v-for="code in CURRENCIES" :key="code">{{ code }}</option>
          </select>
        </div>
        <button
          type="button"
          class="fr__icon-button"
          aria-label="Swap currencies"
          @click="swap"
        >
          ⇄
        </button>
        <div class="fr__field">
          <label for="convert-to">To</label>
          <select id="convert-to" v-model="to">
            <option v-for="code in CURRENCIES" :key="code">{{ code }}</option>
          </select>
        </div>
      </div>
    </form>

    <section aria-live="polite" class="fr__conversion">
      <template v-if="rate">
        <p class="fr__amount fr__conversion-result">{{ converted ?? '–' }}</p>
        <p class="fr__hint">
          1 {{ rate.base }} = {{ rate.rate }} {{ rate.quote }}, rate from
          {{ rate.date }}
        </p>
      </template>
      <p v-else-if="!isFetching" role="alert" class="fr__problem">
        No exchange rate yet. Connect to the internet once to get one.
      </p>
    </section>

    <button type="button" class="fr__button--primary" @click="leave">
      Done
    </button>
  </div>
</template>

<style>
.fr__conversion {
  & p {
    margin: 0;
  }

  & .fr__conversion-result {
    font-size: 2.75rem;
    font-weight: 600;
    line-height: 1.1;
  }
}
</style>
