import { expect, test } from 'vitest';
import { answer, confirmAction, pendingConfirm } from './confirm';

test('resolves with the answer and clears the question', async () => {
  const confirmed = confirmAction('Delete it?', 'Delete');
  expect(pendingConfirm.value?.message).toBe('Delete it?');

  answer(true);

  expect(await confirmed).toBe(true);
  expect(pendingConfirm.value).toBeNull();
});

test('a newer question cancels the unanswered one', async () => {
  const first = confirmAction('First?', 'Yes');
  const second = confirmAction('Second?', 'Yes');

  expect(await first).toBe(false);
  expect(pendingConfirm.value?.message).toBe('Second?');
  answer(true);
  expect(await second).toBe(true);
});
