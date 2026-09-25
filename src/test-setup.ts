import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { db } from './db';

beforeEach(async () => {
  await db.delete();
  await db.open();
  setActivePinia(createPinia());
});
