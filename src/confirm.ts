import { shallowRef } from 'vue';

export type ConfirmRequest = {
  message: string;
  /** Names the action, e.g. "Delete", so the button says what it does. */
  confirmLabel: string;
  resolve: (confirmed: boolean) => void;
};

/** The question waiting for an answer, shown by ConfirmDialog. */
export const pendingConfirm = shallowRef<ConfirmRequest | null>(null);

/**
 * In-app replacement for window.confirm, which browsers offer to silence
 * after a few prompts. A newer question dismisses an unanswered one.
 */
export function confirmAction(message: string, confirmLabel: string) {
  answer(false);
  return new Promise<boolean>((resolve) => {
    pendingConfirm.value = { message, confirmLabel, resolve };
  });
}

export function answer(confirmed: boolean) {
  pendingConfirm.value?.resolve(confirmed);
  pendingConfirm.value = null;
}
