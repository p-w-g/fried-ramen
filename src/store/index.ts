import { createStore } from 'vuex';
import { expenseModel } from '../models';

export default createStore({
  state: {
    latestID: 0,
    labels: [],
    allExpensesList: Array<expenseModel>(),
    expense_lists: Array<Array<expenseModel>>(),
  },

  mutations: {
    loadJson(state) {
      state.allExpensesList = JSON.parse(
        localStorage.getItem('allExpensesList')!
      );
    },

    loadAllLists(state) {
      state.expense_lists = JSON.parse(localStorage.getItem('expense_lists')!);
    },

    loadLabelJson(state) {
      state.labels = JSON.parse(localStorage.getItem('labels')!);
    },

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

    saveLabelJson(state) {
      localStorage.setItem('labels', JSON.stringify(state.labels));
    },

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
      localStorage.setItem('labels', JSON.stringify(state.labels));
    },

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

    addNewLabel(state, payload) {
      state.labels.push(payload.Label);
    },

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

    labelExpense(state, payload) {
      state.allExpensesList.find(({ Id }) => Id === payload.Id).Label =
        payload.Label;
    },

    labelExpenseInList(state, payload) {
      state.expense_lists[payload.list].find(
        ({ Id }) => Id === payload.Id
      ).Label = payload.Label;
    },

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

      state.allExpensesList.splice(expense_to_remove, 1);
    },

    /**
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
      state.labels = [];
    },
  },

  actions: {
    addNewExpenseAction(context, payload) {
      context.commit('updateLatestID');
      context.commit('addNewExpense', payload);
      context.commit('saveJson');
    },

    updateExpenseAction(context, payload) {
      context.commit('updateExpense', payload);
      context.commit('saveJson');
    },

    addNewLabelAction(context, payload) {
      context.commit('addNewLabel', payload);
      context.commit('saveLabelJson');
    },

    labelThisExpenseAction(context, payload) {
      context.commit('labelExpense', payload);
      context.commit('saveJson');
    },

    loadJsonAttemptAction(context) {
      if (localStorage.getItem('allExpensesList')) {
        context.commit('loadJson');
        context.commit('updateLatestID');
      }
      if (localStorage.getItem('labels')) {
        context.commit('loadLabelJson');
      }
    },

    saveToLocalStorageAction(context) {
      context.commit('saveJson');
    },

    saveLabelToLocalStorageAction(context) {
      context.commit('saveLabelJson');
    },

    saveAllToLocalStorageAction(context) {
      context.commit('saveJson');
      context.commit('saveLabelJson');
    },

    removeThisTaskAction(context, index) {
      context.commit('remove', index);
      context.commit('saveJson');
    },

    removeAllTasksAction(context) {
      context.commit('deleteAll');
      context.commit('saveAllJson');
    },

    removeLabelAttemptAction(context, payload) {
      context.commit('deleteLabelIfEmpty', payload.Label);
      context.commit('saveLabelJson');
    },
  },
  getters: {
    filterUnassigned: (state) => {
      return state.allExpensesList != null
        ? state.allExpensesList.filter((expense) => !expense.Label)
        : [];
    },

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

    labels: (state): Array<string> => {
      return state.labels;
    },

    unassignedTotal: (state, getters) => {
      const amounts: Array<number> = getters.filterUnassigned.map(
        (e: expenseModel) => e.Amount
      );

      return amounts.reduce(
        (accumulator: number, current: number) =>
          Number(accumulator) + Number(current),
        0
      );
    },
  },
});
