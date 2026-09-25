import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '@/db';
import { createBackup, parseBackup, restoreBackup } from '@/backup';
import { useBudgetStore } from './budget';

const DAY_MS = 24 * 60 * 60 * 1000;

export const useBackupStore = defineStore('backup', () => {
  const lastExportedAt = ref<number | null>(null);
  /** Whether the browser promised not to evict our data under pressure. */
  const isStoragePersistent = ref(false);

  async function checkUp() {
    const meta = await db.meta.get('lastExportedAt');
    lastExportedAt.value = meta?.value ?? null;
    isStoragePersistent.value = (await navigator.storage?.persist?.()) ?? false;
  }

  function daysSinceExport(now = Date.now()) {
    if (lastExportedAt.value === null) return null;
    return Math.floor((now - lastExportedAt.value) / DAY_MS);
  }

  /** Returns the JSON file contents; the caller decides how to hand it over. */
  async function exportAll(now = new Date()) {
    const backup = await createBackup(now);
    await db.meta.put({ key: 'lastExportedAt', value: now.getTime() });
    lastExportedAt.value = now.getTime();
    return JSON.stringify(backup, null, 2);
  }

  /** Throws InvalidBackupError before touching any data if the file is bad. */
  async function importAll(text: string) {
    await restoreBackup(parseBackup(text));
    await useBudgetStore().open();
  }

  return {
    lastExportedAt,
    isStoragePersistent,
    checkUp,
    daysSinceExport,
    exportAll,
    importAll,
  };
});
