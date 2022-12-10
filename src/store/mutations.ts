import {
  expense_model,
  expense_payload,
  label_payload,
  state_model,
} from '@/interfaces';
import { expenseModel } from '@/models';

/**
 * deprecated and awaiting removal
 */
export const loadJson = (state: any) => {
  state.allExpensesList = JSON.parse(localStorage.getItem('allExpensesList')!);
};

export const loadAllLists = (state: state_model) => {
  state.expense_lists = JSON.parse(localStorage.getItem('expense_lists')!);
};

/**
 * deprecated and awaiting removal
 */
export const loadLabelJson = (state: any) => {
  state.labels = JSON.parse(localStorage.getItem('labels')!);
};

export const loadAllLabels = (state: state_model) => {
  state.labels_list = JSON.parse(localStorage.getItem('labels_list')!);
};

/**
 * deprecated and awaiting removal
 */
export const saveJson = (state: any) => {
  localStorage.setItem(
    'allExpensesList',
    JSON.stringify(state.allExpensesList)
  );
};

export const saveAllLists = (state: state_model) => {
  localStorage.setItem('expense_lists', JSON.stringify(state.expense_lists));
};

/**
 * deprecated and awaiting removal
 */
export const saveLabelJson = (state: any) => {
  localStorage.setItem('labels', JSON.stringify(state.labels));
};

export const saveAllLabels = (state: state_model) => {
  localStorage.setItem('labels_list', JSON.stringify(state.labels_list));
};

/**
 * deprecated and awaiting removal
 */
export const saveAllJson = (state: any) => {
  localStorage.setItem(
    'allExpensesList',
    JSON.stringify(state.allExpensesList)
  );
  localStorage.setItem('labels', JSON.stringify(state.labels));
};

export const saveAllDataToLocalStorage = (state: state_model) => {
  localStorage.setItem('expense_lists', JSON.stringify(state.expense_lists));
  localStorage.setItem('labels_list', JSON.stringify(state.labels_list));
};

/**
 * deprecated and awaiting removal
 */
export const addNewExpense = (state: any, expense: expenseModel) => {
  state.allExpensesList.push({
    Expense: expense.Expense,
    Amount: expense.Amount,
    Description: expense.Description,
    Id: state.latestID,
    isPostponed: false,
  });
};

export const addNewExpenseToList = (
  state: state_model,
  payload: expense_payload
) => {
  state.expense_lists[payload.list].push({
    Expense: payload.Expense,
    Amount: payload.Amount,
    Description: payload.Description,
    Id: state.latestID,
    isPostponed: false,
  });
};

/**
 * deprecated and awaiting removal
 */
export const updateExpense = (state: any, payload: expenseModel) => {
  const target_expense = state.allExpensesList.find(
    ({ Id }: { Id: number }) => Id === payload.Id
  );

  target_expense.Amount = payload.Amount;
  target_expense.Description = payload.Description;
  target_expense.Expense = payload.Expense;
};

export const updateExpenseInList = (
  state: state_model,
  payload: expense_payload
) => {
  const target_expense = state.expense_lists[payload.list].find(
    ({ Id }) => Id === payload.Id
  );

  target_expense.Amount = payload.Amount;
  target_expense.Description = payload.Description;
  target_expense.Expense = payload.Expense;
};

/**
 * deprecated and awaiting removal
 */
export const addNewLabel = (state: any, payload: expense_payload) => {
  state.labels.push(payload.Label);
};

export const addNewLabelForList = (
  state: state_model,
  payload: label_payload
) => {
  state.labels_list[payload.list].push(payload.Label);
};

/**
 * deprecated and awaiting removal
 */
export const updateLatestID = (state: any) => {
  const list_of_IDs = state.allExpensesList.map((el: any) => el.Id);
  const highest_id = Math.max(...list_of_IDs);

  highest_id > state.latestID
    ? (state.latestID = highest_id)
    : state.latestID++;
};

export const updateLatestIDForAllLists = (state: state_model) => {
  /**
   * parse all lists to check for highest ID
   * save it to state - latestID
   * Save latestId to json
   * assign the ID for all of the lists, meaning the ID is individual and doesnt come up again.
   */
  // const list_of_IDs = state.allExpensesList.map((el) => el.Id);
  // const highest_id = Math.max(...list_of_IDs);
  // highest_id > state.latestID
  //   ? (state.latestID = highest_id)
  //   : state.latestID++;
};

/**
 * deprecated and awaiting removal
 */
export const labelExpense = (state: any, payload: any) => {
  state.allExpensesList.find(
    ({ Id }: { Id: number }) => Id === payload.Id
  ).Label = payload.Label;
};

export const labelExpenseInList = (
  state: state_model,
  payload: label_payload
) => {
  state.expense_lists[payload.list].find(({ Id }) => Id === payload.Id).Label =
    payload.Label;
};

/**
 * deprecated and awaiting removal
 */
export const remove = (state: any, payload: any) => {
  const expense_to_remove = state.allExpensesList.findIndex(
    ({ Id }: { Id: number }) => Id === payload.index
  );

  state.allExpensesList.splice(expense_to_remove, 1);
};

export const removeInList = (state: state_model, payload: label_payload) => {
  const expense_to_remove = state.expense_lists[payload.list].findIndex(
    ({ Id }) => Id === payload.index
  );

  state.expense_lists[payload.list].splice(expense_to_remove, 1);
};

/**
 * deprecated and awaiting removal
 * Attempts to delete label only if
 * doesnt find any object assigned to that label
 */
export const deleteLabelIfEmpty = (state: any, lbl: any) => {
  const label_to_delete = state.labels.findIndex((Label: string) => {
    lbl === Label;
  });

  const no_expenses_with_label = !state.allExpensesList.find(
    ({ Label }: { Label: string }) => lbl === Label
  );

  if (no_expenses_with_label) {
    state.labels.splice(label_to_delete, 1);
  }
};

export const deleteLabelForList = (
  state: state_model,
  payload: label_payload
) => {
  const label_to_delete = state.labels_list[payload.list].findIndex((Label) => {
    payload.Label === Label;
  });

  const no_expenses_with_label = !state.expense_lists[payload.list].find(
    ({ Label }) => payload.Label === Label
  );

  if (no_expenses_with_label) {
    state.labels_list[payload.list].splice(label_to_delete, 1);
  }
};

/**
 * deprecated and awaiting removal
 */
export const deleteAll = (state: any) => {
  state.allExpensesList = [];
  state.labels = [];
};

export const deleteThisList = (
  state: state_model,
  payload: expense_payload
) => {
  /**
   * TODO: for now set it to empty array,
   * when implementing full programmatically added lists, and removal of lists,
   * the list from payload needs to be nuked.
   */
  state.expense_lists[payload.list] = [];
  state.labels_list[payload.list] = [];
};
