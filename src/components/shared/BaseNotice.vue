<script setup lang="ts">
const { tone = 'info' } = defineProps<{ tone?: 'info' | 'danger' }>();
</script>

<!-- A non-blocking message; the caller sets its role (alert or status). -->
<template>
  <div class="fr__notice" :class="`fr__notice--${tone}`">
    <div class="fr__notice-body"><slot /></div>
    <slot name="action" />
  </div>
</template>

<style>
.fr__notices {
  position: fixed;
  inset: 1rem 1rem auto;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fr__notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--pressed);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);

  & p {
    margin: 0;
  }

  & button {
    margin: 0;
  }

  &.fr__notice--danger {
    border: 2px solid var(--danger);
  }
}

.fr__notice-body {
  flex: 1;
}
</style>
