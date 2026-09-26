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
/* In the flow and sticky, so a notice pushes content down, never covers it. */
.fr__notices {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 0.5rem 1rem 0;

  &:empty {
    display: none;
  }
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fr__notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-container);
  box-shadow: var(--shadow-float);

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
