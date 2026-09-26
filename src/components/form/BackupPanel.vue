<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { InvalidBackupError } from '@/backup';
import { confirmAction } from '@/confirm';
import { useBackupStore } from '@/stores/backup';

const backup = useBackupStore();
const fileInput = useTemplateRef('file-input');
const problem = ref('');

const lastExportLabel = computed(() => {
  const days = backup.daysSinceExport();
  if (days === null) return 'never';
  if (days === 0) return 'today';
  return days === 1 ? 'yesterday' : `${days} days ago`;
});

async function exportNow() {
  const json = await backup.exportAll();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(
    new Blob([json], { type: 'application/json' }),
  );
  link.download = `fried-ramen-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importFrom(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  const confirmed = await confirmAction(
    'Replace everything in Fried Ramen with this backup?',
    'Replace',
  );
  if (!confirmed) return;
  try {
    problem.value = '';
    await backup.importAll(await file.text());
  } catch (error) {
    if (!(error instanceof InvalidBackupError)) throw error;
    problem.value = error.message;
  }
}
</script>

<template>
  <section class="fr__backup">
    <h2 class="fr__subheading">Backup</h2>
    <p>Last backup: {{ lastExportLabel }}</p>
    <p v-if="!backup.isStoragePersistent" class="fr__hint">
      This browser may clear your data. Keep a backup.
    </p>
    <p v-if="problem" role="alert" class="fr__problem">{{ problem }}</p>
    <div class="fr__actions">
      <button type="button" @click="exportNow">Export backup</button>
      <button type="button" @click="fileInput?.click()">Import backup</button>
    </div>
    <input
      ref="file-input"
      type="file"
      accept="application/json,.json"
      hidden
      aria-label="Backup file"
      @change="importFrom"
    />
  </section>
</template>

<style>
.fr__backup {
  & p {
    margin: 0.25rem 0;
  }

  & .fr__actions {
    margin-top: 0.75rem;
  }
}
</style>
