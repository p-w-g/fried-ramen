import { createStore } from 'vuex';
import { expenseModel } from '../models';
import {
  labels_list,
  label_payload,
  expense_list,
  expense_payload,
  expense_model,
} from '../interfaces';

export default createStore({
  state: {
    latestID: 0,
    labels: [], // deprecated, awaiting removal
    labels_list: {} as labels_list,
    allExpensesList: Array<expenseModel>(), // deprecated, awaiting removal
    expense_lists: {} as expense_list,
  },

  mutations: {
    /**
     * deprecated and awaiting removal
     */
    loadJson(state) {
      state.allExpensesList = JSON.parse(
        localStorage.getItem('allExpensesList')!
      );
    },

    loadAllLists(state) {
      state.expense_lists = JSON.parse(localStorage.getItem('expense_lists')!);
    },

    /**
     * deprecated and awaiting removal
     */
    loadLabelJson(state) {
      state.labels = JSON.parse(localStorage.getItem('labels')!);
    },

    loadAllLabels(state) {
      state.labels = JSON.parse(localStorage.getItem('labels_list')!);
    },

    /**
     * deprecated and awaiting removal
     */
    saveJson(state) {
      localStorage.setItem(
        'allExpensesList',
        JSON.stringify(state.allExpensesList)
      );
    },

    saveAllLists(state) {
      localStorage.setItem(
        'expense_lists',
        JSON.stringify(state.expense_lists)
      );
    },

    /**
     * deprecated and awaiting removal
     */
    saveLabelJson(state) {
      localStorage.setItem('labels', JSON.stringify(state.labels));
    },

    saveAllLabels(state) {
      localStorage.setItem('labels_list', JSON.stringify(state.labels_list));
    },

    /**
     * deprecated and awaiting removal
     */
    saveAllJson(state) {
      localStorage.setItem(
        'allExpensesList',
        JSON.stringify(state.allExpensesList)
      );
      localStorage.setItem('labels', JSON.stringify(state.labels));
    },

    saveAllDataToLocalStorage(state) {
      localStorage.setItem(
        'expense_lists',
        JSON.stringify(state.expense_lists)
      );
      localStorage.setItem('labels_list', JSON.stringify(state.labels_list));
    },

    /**
     * deprecated and awaiting removal
     */
    addNewExpense(state, expense: expenseModel) {
      state.allExpensesList.push({
        Expense: expense.Expense,
        Amount: expense.Amount,
        Description: expense.Description,
        Id: state.latestID,
        isPostponed: false,
      });
    },

    addNewExpenseToList(state, payload) {
      state.expense_lists[payload.list].push({
        Expense: payload.Expense,
        Amount: payload.Amount,
        Description: payload.Description,
        Id: state.latestID,
        isPostponed: false,
      });
    },

    /**
     * deprecated and awaiting removal
     */
    updateExpense(state, payload: expenseModel) {
      const target_expense = state.allExpensesList.find(
        ({ Id }) => Id === payload.Id
      );

      target_expense.Amount = payload.Amount;
      target_expense.Description = payload.Description;
      target_expense.Expense = payload.Expense;
    },

    updateExpenseInList(state, payload) {
      const target_expense = state.expense_lists[payload.list].find(
        ({ Id }) => Id === payload.Id
      );

      target_expense.Amount = payload.Amount;
      target_expense.Description = payload.Description;
      target_expense.Expense = payload.Expense;
    },

    /**
     * deprecated and awaiting removal
     */
    addNewLabel(state, payload) {
      state.labels.push(payload.Label);
    },

    addNewLabelForList(state, payload: label_payload) {
      state.labels_list[payload.list].push(payload.Label);
    },

    /**
     * deprecated and awaiting removal
     */
    updateLatestID(state) {
      const list_of_IDs = state.allExpensesList.map((el) => el.Id);
      const highest_id = Math.max(...list_of_IDs);

      highest_id > state.latestID
        ? (state.latestID = highest_id)
        : state.latestID++;
    },

    updateLatestIDForAllLists(state) {
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
    },

    /**
     * deprecated and awaiting removal
     */
    labelExpense(state, payload) {
      state.allExpensesList.find(({ Id }) => Id === payload.Id).Label =
        payload.Label;
    },

    labelExpenseInList(state, payload: label_payload) {
      state.expense_lists[payload.list].find(
        ({ Id }) => Id === payload.Id
      ).Label = payload.Label;
    },

    /**
     * deprecated and awaiting removal
     */
    remove(state, payload) {
      const expense_to_remove = state.allExpensesList.findIndex(
        ({ Id }) => Id === payload.index
      );

      state.allExpensesList.splice(expense_to_remove, 1);
    },

    removeInList(state, payload) {
      const expense_to_remove = state.expense_lists[payload.list].findIndex(
        ({ Id }) => Id === payload.index
      );

      state.expense_lists[payload.list].splice(expense_to_remove, 1);
    },

    /**
     * deprecated and awaiting removal
     * Attempts to delete label only if
     * doesnt find any object assigned to that label
     */
    deleteLabelIfEmpty(state, lbl) {
      const label_to_delete = state.labels.findIndex((Label) => {
        lbl === Label;
      });

      const no_expenses_with_label = !state.allExpensesList.find(
        ({ Label }) => lbl === Label
      );

      if (no_expenses_with_label) {
        state.labels.splice(label_to_delete, 1);
      }
    },

    deleteLabelForList(state, payload: label_payload) {
      const label_to_delete = state.labels_list[payload.list].findIndex(
        (Label) => {
          payload.Label === Label;
        }
      );

      const no_expenses_with_label = !state.expense_lists[payload.list].find(
        ({ Label }) => payload.Label === Label
      );

      if (no_expenses_with_label) {
        state.labels_list[payload.list].splice(label_to_delete, 1);
      }
    },

    /**
     * deprecated and awaiting removal
     */
    deleteAll(state) {
      state.allExpensesList = [];
      state.labels = [];
    },

    deleteThisList(state, payload) {
      /**
       * TODO: for now set it to empty array,
       * when implementing full programmatically added lists, and removal of lists,
       * the list from payload needs to be nuked.
       */
      state.expense_lists[payload.list] = [];
      state.labels_list[payload.list] = [];
    },
  },

  actions: {
    /**
     * deprecated and awaiting removal
     */
    addNewExpenseAction(context, payload) {
      context.commit('updateLatestID');
      context.commit('addNewExpense', payload);
      context.commit('saveJson');
    },

    addNewExpenseToListAction(context, payload) {
      context.commit('updateLatestIDForAllLists');
      context.commit('addNewExpenseToList', payload);
      context.commit('saveAllLists');
    },

    /**
     * deprecated and awaiting removal
     */
    updateExpenseAction(context, payload) {
      context.commit('updateExpense', payload);
      context.commit('saveJson');
    },

    updateExpenseInListAction(context, payload) {
      context.commit('updateExpenseInList', payload);
      context.commit('saveAllLists');
    },

    /**
     * deprecated and awaiting removal
     */
    addNewLabelAction(context, payload) {
      context.commit('addNewLabel', payload);
      context.commit('saveLabelJson');
    },

    addNewLabelForListAction(context, payload) {
      context.commit('addNewLabelForList', payload);
      context.commit('saveAllLabels');
    },

    /**
     * deprecated and awaiting removal
     */
    labelThisExpenseAction(context, payload) {
      context.commit('labelExpense', payload);
      context.commit('saveJson');
    },

    labelExpenseInListAction(context, payload) {
      context.commit('labelExpenseInList', payload);
      context.commit('saveAllLists');
    },
    /**
     * deprecated and awaiting removal
     */
    loadJsonAttemptAction(context) {
      if (localStorage.getItem('allExpensesList')) {
        context.commit('loadJson');
        context.commit('updateLatestID');
      }
      if (localStorage.getItem('labels')) {
        context.commit('loadLabelJson');
      }
    },

    /**
     * Also do a migrate on load
     */
    attemptLoadAllDataAction(context) {
      if (localStorage.getItem('expense_lists')) {
        context.commit('loadAllLists');
        context.commit('updateLatestIDForAllLists');
      }

      if (localStorage.getItem('labels_list')) {
        context.commit('loadAllLabels');
      }
    },

    /**
     * deprecated and awaiting removal
     */
    saveToLocalStorageAction(context) {
      context.commit('saveJson');
    },

    saveExpensesToLocalStoradeAction(context) {
      context.commit('saveAllLists');
    },

    /**
     * deprecated and awaiting removal
     */
    saveLabelToLocalStorageAction(context) {
      context.commit('saveLabelJson');
    },

    saveLabelsToLocalStorageAction(context) {
      context.commit('saveAllLabels');
    },

    /**
     * deprecated and awaiting removal
     */
    saveAllToLocalStorageAction(context) {
      context.commit('saveJson');
      context.commit('saveLabelJson');
    },

    saveLabelsAndExpensesAction(context) {
      context.commit('saveAllLists');
      context.commit('saveAllLabels');
    },

    /**
     * deprecated and awaiting removal
     */
    removeThisTaskAction(context, index) {
      context.commit('remove', index);
      context.commit('saveJson');
    },

    removeTaskFromListAction(context, payload: expense_payload) {
      /**
       * need List and ID,
       * it is critical to verify
       * the functionality isnt affected
       */
      context.commit('removeInList', payload);
      context.commit('saveAllLists');
    },

    /**
     * deprecated and awaiting removal
     */
    removeAllTasksAction(context) {
      context.commit('deleteAll');
      context.commit('saveAllJson');
    },

    removeAListAction(context, payload: expense_payload) {
      /**
       * needs a List key at the least
       */
      context.commit('deleteThisList', payload);
      context.commit('saveAllLists');
    },

    /**
     * deprecated and awaiting removal
     */
    removeLabelAttemptAction(context, payload) {
      context.commit('deleteLabelIfEmpty', payload.Label);
      context.commit('saveLabelJson');
    },

    removeLabelFromAListAttemptAction(context, payload: label_payload) {
      context.commit('deleteLabelForList', payload);
      context.commit('saveLabelJson');
    },
  },

  getters: {
    /**
     * deprecated and awaiting removal
     */
    filterUnassigned: (state) => {
      return state.allExpensesList != null
        ? state.allExpensesList.filter((expense) => !expense.Label)
        : [];
    },

    /**
     * verify that its possible to send second argument
     */
    filterUnassignedForList: (state, list) => {
      return state.expense_lists[list] != null
        ? state.expense_lists[list].filter((expense) => !expense.Label)
        : [];
    },

    /**
     * deprecated and awaiting removal
     */
    totalTotal: (state): number => {
      const amounts: Array<number> = state.allExpensesList.map(
        (e: expenseModel) => e.Amount
      );

      return amounts.reduce(
        (accumulator: number, current: number) =>
          Number(accumulator) + Number(current),
        0
      );
    },

    /**
     * verify that its possible to send second argument
     */
    totalForList: (state, list): number => {
      const amounts: number[] = state.expense_lists[list].map(
        (e: expense_model) => e.Amount
      );

      return amounts.reduce(
        (accumulator: number, current: number) =>
          Number(accumulator) + Number(current),
        0
      );
    },

    /**
     * deprecated and awaiting removal
     */
    labels: (state): Array<string> => {
      return state.labels;
    },

    /**
     * verify that its possible to send second argument
     */
    labelsForList: (state, list): string[] => {
      return state.labels_list[list];
    },
  },
});
