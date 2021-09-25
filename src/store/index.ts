import { createStore } from 'vuex';
import { expenseModel } from '../models';

export default createStore({
  state: {
    latestID: 0,
    allExpensesList: Array<expenseModel>()
  },

  mutations: {
    loadJson(state) {
      state.allExpensesList = JSON.parse(
        localStorage.getItem('allExpensesList')!
      );
    },
    saveJson(state) {
      localStorage.setItem(
        'allExpensesList',
        JSON.stringify(state.allExpensesList)
      );
    },
    addNewExpense(state, expense: expenseModel) {
      state.allExpensesList.push({
        Expense: expense.Expense,
        Amount: expense.Amount,
        Id: state.latestID,
        isPostponed: false
      });
    },

    updateLatestID(state) {
      const filterOutIds = state.allExpensesList.map(el => el.Id);
      const highestId = Math.max(...filterOutIds);

      highestId > state.latestID
        ? (state.latestID = highestId)
        : state.latestID++;
    },

    freeze(state, index) {
      state.allExpensesList.find(
        ({ Id }) => Id === index.index
      ).isPostponed = true;
    },

    advance(state, index) {
      state.allExpensesList.find(
        ({ Id }) => Id === index.index
      ).isPostponed = false;
    },

    remove(state, index) {
      for (let i = 0; i < state.allExpensesList.length; i++) {
        if (index.index === state.allExpensesList[i].Id) {
          state.allExpensesList.splice(i, 1);
        }
      }
    },

    deleteAll(state) {
      state.allExpensesList = [];
    }
  },
  actions: {
    addNewExpenseAction(context, payload) {
      context.commit('updateLatestID');
      context.commit('addNewExpense', payload);
      context.commit('saveJson');
    },
    advanceThisExpenseAction(context, index) {
      context.commit('advance', index);
      context.commit('saveJson');
    },
    freezeThisExpenseAction(context, index) {
      context.commit('freeze', index);
      context.commit('saveJson');
    },
    loadJsonAttemptAction(context) {
      if (localStorage.getItem('allExpensesList')) {
        context.commit('loadJson');
        context.commit('updateLatestID');
      }
    },
    saveToLocalStorageAction(context) {
      context.commit('saveJson');
    },
    removeThisTaskAction(context, index) {
      context.commit('remove', index);
      context.commit('saveJson');
    },
    removeAllTasksAction(context) {
      context.commit('deleteAll');
      context.commit('saveJson');
    }
  },
  getters: {
    filterFrozen: state => {
      return state.allExpensesList != null
        ? state.allExpensesList.filter(expense => expense.isPostponed)
        : [];
    },
    filterActive: state => {
      return state.allExpensesList != null
        ? state.allExpensesList.filter(expense => !expense.isPostponed)
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
    frozenTotal: (state, getters) => {
      return getters.filterFrozen.reduce(
        (accumulator: number, currentObject: expenseModel) =>
          accumulator + currentObject.Amount,
        0
      );
    },
    activeTotal: (state, getters) => {
      return getters.filterActive.reduce(
        (accumulator: number, currentObject: expenseModel) =>
          accumulator + currentObject.Amount,
        0
      );
    }
  }
});
