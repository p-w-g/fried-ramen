import { expense_payload, label_payload } from '@/interfaces';

/**
 * deprecated and awaiting removal
 */
export const addNewExpenseAction = (context: any, payload: expense_payload) => {
  context.commit('updateLatestID');
  context.commit('addNewExpense', payload);
  context.commit('saveJson');
};

export const addNewExpenseToListAction = (context: any, payload: expense_payload) => {
  context.commit('updateLatestIDForAllLists');
  context.commit('addNewExpenseToList', payload);
  context.commit('saveAllLists');
};

/**
 * deprecated and awaiting removal
 */
export const updateExpenseAction = (context: any, payload: expense_payload) => {
  context.commit('updateExpense', payload);
  context.commit('saveJson');
};

export const updateExpenseInListAction = (context: any, payload: expense_payload) => {
  context.commit('updateExpenseInList', payload);
  context.commit('saveAllLists');
};

/**
 * deprecated and awaiting removal
 */
export const addNewLabelAction = (context: any, payload: label_payload) => {
  context.commit('addNewLabel', payload);
  context.commit('saveLabelJson');
};

export const addNewLabelForListAction = (context: any, payload: label_payload) => {
  context.commit('addNewLabelForList', payload);
  context.commit('saveAllLabels');
};

/**
 * deprecated and awaiting removal
 */
export const labelThisExpenseAction = (context: any, payload: label_payload) => {
  context.commit('labelExpense', payload);
  context.commit('saveJson');
};

export const labelExpenseInListAction = (context: any, payload: label_payload) => {
  context.commit('labelExpenseInList', payload);
  context.commit('saveAllLists');
};
/**
 * deprecated and awaiting removal
 */
export const loadJsonAttemptAction = (context: any) => {
  if (localStorage.getItem('allExpensesList')) {
    context.commit('loadJson');
    context.commit('updateLatestID');
  }
  if (localStorage.getItem('labels')) {
    context.commit('loadLabelJson');
  }
};

/**
 * Also do a migrate on load
 */
export const attemptLoadAllDataAction = (context: any) => {
  if (localStorage.getItem('expense_lists')) {
    context.commit('loadAllLists');
    context.commit('updateLatestIDForAllLists');
  }

  if (localStorage.getItem('labels_list')) {
    context.commit('loadAllLabels');
  }
};

/**
 * deprecated and awaiting removal
 */
export const saveToLocalStorageAction = (context: any) => {
  context.commit('saveJson');
};

export const saveExpensesToLocalStoradeAction = (context: any) => {
  context.commit('saveAllLists');
};

/**
 * deprecated and awaiting removal
 */
export const saveLabelToLocalStorageAction = (context: any) => {
  context.commit('saveLabelJson');
};

export const saveLabelsToLocalStorageAction = (context: any) => {
  context.commit('saveAllLabels');
};

/**
 * deprecated and awaiting removal
 */
export const saveAllToLocalStorageAction = (context: any) => {
  context.commit('saveJson');
  context.commit('saveLabelJson');
};

export const saveLabelsAndExpensesAction = (context: any) => {
  context.commit('saveAllLists');
  context.commit('saveAllLabels');
};

/**
 * deprecated and awaiting removal
 */
export const removeThisTaskAction = (context: any, index: number) => {
  context.commit('remove', index);
  context.commit('saveJson');
};

export const removeTaskFromListAction = (
  context: any,
  payload: expense_payload
) => {
  /**
   * need List and ID,
   * it is critical to verify
   * the functionality isnt affected
   */
  context.commit('removeInList', payload);
  context.commit('saveAllLists');
};

/**
 * deprecated and awaiting removal
 */
export const removeAllTasksAction = (context: any) => {
  context.commit('deleteAll');
  context.commit('saveAllJson');
};

export const removeAListAction = (context: any, payload: expense_payload) => {
  /**
   * needs a List key at the least
   */
  context.commit('deleteThisList', payload);
  context.commit('saveAllLists');
};

/**
 * deprecated and awaiting removal
 */
export const removeLabelAttemptAction = (context: any, payload: any) => {
  context.commit('deleteLabelIfEmpty', payload.Label);
  context.commit('saveLabelJson');
};

export const removeLabelFromAListAttemptAction = (
  context: any,
  payload: label_payload
) => {
  context.commit('deleteLabelForList', payload);
  context.commit('saveLabelJson');
};
