<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import {
  CURRENCIES,
  convertCents,
  toCents,
  type Currency,
  type Rate,
} from '@/domain';
import { useLeave } from '@/leave';
import { useFormatStore } from '@/stores/format';
import { getRate } from '@/rates';

const leave = useLeave();
const format = useFormatStore();
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

function swap() {
  [from.value, to.value] = [to.value, from.value];
}

/** Read in the chosen number format, so 300万 or 30L work as typed. */
const amountCents = computed(() => {
  const amount = format.read(typed.value);
  return amount === null ? null : toCents(amount);
});

/** What was typed, written out in full: 300万 reads back as 3,000,000. */
const typedShown = computed(() =>
  typed.value.trim() && amountCents.value !== null
    ? format.bareMoney(amountCents.value, from.value)
    : null,
);

const convertedCents = computed(() =>
  rate.value && amountCents.value !== null
    ? convertCents(amountCents.value, rate.value)
    : null,
);

const converted = computed(() =>
  convertedCents.value === null
    ? null
    : format.bareMoney(convertedCents.value, to.value),
);

/** How the number format says a large result: ≈ 476万, ≈ 4.76Cr, ≈ 4.76M. */
const convertedShort = computed(() =>
  convertedCents.value !== null && Math.abs(convertedCents.value) >= 1_000_000
    ? format.compact(convertedCents.value)
    : null,
);
</script>

<template>
  <div class="fr__page">
    <h1>Currency</h1>
    <form class="fr__stack" @submit.prevent>
      <div class="fr__field">
        <label for="convert-amount">Amount</label>
        <input id="convert-amount" v-model="typed" type="text" />
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
        <template v-if="typedShown">
          <p class="fr__amount fr__conversion-from">
            {{ typedShown }} {{ from }}
          </p>
          <p class="fr__hint">equals</p>
        </template>
        <p class="fr__amount fr__conversion-result">{{ converted ?? '–' }}</p>
        <p v-if="convertedShort" class="fr__hint fr__conversion-short">
          ≈ {{ convertedShort }}
        </p>
        <p class="fr__conversion-rate">
          1 {{ rate.base }} = {{ rate.rate }} {{ rate.quote }}
        </p>
        <p class="fr__hint fr__conversion-date">Rate from {{ rate.date }}</p>
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

  & .fr__conversion-from {
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* The answer is the point of the page: as large as a phone can fit. */
  & .fr__conversion-result {
    font-size: 3.5rem;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.02em;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  & .fr__conversion-rate {
    margin-top: 0.5rem;
    font-size: 1.125rem;
    font-weight: 500;
  }

  & .fr__conversion-date {
    font-size: 0.875rem;
  }
}
</style>
