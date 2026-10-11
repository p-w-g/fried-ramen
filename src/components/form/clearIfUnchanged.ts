import type { Ref } from 'vue';

/**
 * Clears a field once its save landed, so a failure keeps what was typed,
 * and only if it still holds what was sent, so a next entry typed while
 * the save was in flight survives.
 */
export function clearIfUnchanged(field: Ref<string>, sent: string) {
  if (field.value === sent) field.value = '';
}
