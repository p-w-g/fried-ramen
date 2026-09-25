import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { db } from './db';

beforeEach(async () => {
  localStorage.clear();
  await db.delete();
  await db.open();
  setActivePinia(createPinia());
});
