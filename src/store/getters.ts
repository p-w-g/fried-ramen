import { expense_model, labels_list, state_model } from '@/interfaces';
import { expenseModel } from '@/models';

/**
 * deprecated and awaiting removal
 */
export const filterUnassigned = (state: any) => {
  return state.allExpensesList != null
    ? state.allExpensesList.filter((expense: any) => !expense.Label)
    : [];
};

/**
 * verify that its possible to send second argument
 * https://vuex.vuejs.org/guide/getters.html#method-style-access
 */
export const filterUnassignedForList = (state: state_model, list: string) => {
  return state.expense_lists[list] != null
    ? state.expense_lists[list].filter((expense) => !expense.Label)
    : [];
};

/**
 * deprecated and awaiting removal
 */
export const totalTotal = (state: any): number => {
  const amounts: Array<number> = state.allExpensesList.map(
    (e: expenseModel) => e.Amount
  );

  return amounts.reduce(
    (accumulator: number, current: number) =>
      Number(accumulator) + Number(current),
    0
  );
};

/**
 * verify that its possible to send second argument
 * https://vuex.vuejs.org/guide/getters.html#method-style-access
 */
export const totalForList = (state: any, list: string): number => {
  const amounts: number[] = state.expense_lists[list].map(
    (e: expense_model) => e.Amount
  );

  return amounts.reduce(
    (accumulator: number, current: number) =>
      Number(accumulator) + Number(current),
    0
  );
};

/**
 * deprecated and awaiting removal
 */
export const labels = (state: any): Array<string> => {
  return state.labels;
};

/**
 * verify that its possible to send second argument
 * https://vuex.vuejs.org/guide/getters.html#method-style-access
 */
export const labelsForList = (state: state_model, list: string): string[] => {
  return state.labels_list[list];
};

export const shownList = (state: state_model) => state.shown_list;
