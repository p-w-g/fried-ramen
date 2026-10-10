<script setup lang="ts">
import { CURRENCIES, type Currency } from '@/domain';

const {
  id,
  label,
  noneLabel = 'None',
} = defineProps<{
  id: string;
  label: string;
  noneLabel?: string;
}>();

/** Undefined is the "none" option: no currency, or no conversion. */
const model = defineModel<Currency | undefined>();
</script>

<template>
  <div class="fr__field fr__field--currency">
    <label :for="id">{{ label }}</label>
    <select
      :id="id"
      :value="model ?? ''"
      @change="
        model =
          (($event.target as HTMLSelectElement).value as Currency) || undefined
      "
    >
      <option value="">{{ noneLabel }}</option>
      <option v-for="code in CURRENCIES" :key="code" :value="code">
        {{ code }}
      </option>
    </select>
  </div>
</template>

<style>
/* Outranks .fr__field's flex: 1, so a code-wide select never stretches. */
.fr__field.fr__field--currency {
  flex: 0 0 7.5rem;
}
</style>
