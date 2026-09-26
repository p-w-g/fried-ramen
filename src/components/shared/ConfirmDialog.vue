<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { answer, pendingConfirm } from '@/confirm';

const dialog = useTemplateRef('dialog');

watch(
  pendingConfirm,
  (request) => {
    if (!dialog.value) return;
    if (request && !dialog.value.open) {
      dialog.value.returnValue = '';
      dialog.value.showModal();
    }
    if (!request) dialog.value.close();
  },
  { flush: 'post' },
);
</script>

<template>
  <!-- Esc closes with an empty returnValue, which counts as cancel. -->
  <dialog
    ref="dialog"
    class="fr__dialog"
    aria-labelledby="fr-confirm-message"
    @close="answer(dialog?.returnValue === 'confirm')"
  >
    <form method="dialog">
      <p id="fr-confirm-message">{{ pendingConfirm?.message }}</p>
      <div class="fr__dialog-actions">
        <button value="cancel" autofocus>Cancel</button>
        <button value="confirm" class="fr__button--danger">
          {{ pendingConfirm?.confirmLabel }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style>
.fr__dialog {
  box-sizing: border-box;
  width: min(24rem, calc(100vw - 2rem));
  padding: 1rem 1.25rem;
  color: var(--text);
  background: var(--surface);
  border: 0;
  border-radius: var(--radius-container);
  box-shadow: var(--shadow-float);

  &::backdrop {
    background: var(--backdrop);
  }
}

.fr__dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;

  & button {
    margin: 0;
  }
}
</style>
