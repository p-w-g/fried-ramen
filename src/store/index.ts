import { createStore } from 'vuex';
import { expenseModel } from '../models';

export default createStore({
  state: {
    latestID: 0,
    labels: [],
    allExpensesList: Array<expenseModel>(),
  },

  mutations: {
    loadJson(state) {
      state.allExpensesList = JSON.parse(
        localStorage.getItem('allExpensesList')!
      );
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

    addNewExpense(state, expense: expenseModel) {
      state.allExpensesList.push({
        Expense: expense.Expense,
        Amount: expense.Amount,
        Description: expense.Description,
        Id: state.latestID,
        isPostponed: false,
      });
    },

    updateExpense(state, payload: expenseModel) {
      const targetExpense = state.allExpensesList.find(
        ({ Id }) => Id === payload.Id
      );

      targetExpense.Amount = payload.Amount;
      targetExpense.Description = payload.Description;
      targetExpense.Expense = payload.Expense;
    },

    addNewLabel(state, payload) {
      state.labels.push(payload.Label);
    },

    updateLatestID(state) {
      const filterOutIds = state.allExpensesList.map((el) => el.Id);
      const highestId = Math.max(...filterOutIds);

      highestId > state.latestID
        ? (state.latestID = highestId)
        : state.latestID++;
    },

    labelExpense(state, payload) {
      state.allExpensesList.find(({ Id }) => Id === payload.Id).Label =
        payload.Label;
    },

    remove(state, index) {
      for (let i = 0; i < state.allExpensesList.length; i++) {
        if (index.index === state.allExpensesList[i].Id) {
          state.allExpensesList.splice(i, 1);
        }
      }
    },

    /**
     * Attempts to delete label only if
     * doesnt find any object assigned to that label
     */
    deleteLabelIfEmpty(state, lbl) {
      for (let i = 0; i < state.labels.length; i++) {
        if (!state.allExpensesList.find(({ Label }) => lbl === Label)) {
          if (lbl === state.labels[i]) {
            state.labels.splice(i, 1);
          }
        }
      }
    },

    deleteAll(state) {
      state.allExpensesList = [];
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
