import { ref } from 'vue';

/** The last unexpected failure, shown to the person until dismissed. */
export const lastError = ref<string | null>(null);

export function reportError(error: unknown) {
  console.error(error);
  lastError.value = error instanceof Error ? error.message : String(error);
}
