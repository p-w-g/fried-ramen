import { createStore } from 'vuex';

export default createStore({
  state: {
    latestID: 0,
    allExpensesList: []
  },
  mutations: {
    loadJson(state) {
      state.allExpensesList = JSON.parse(
        localStorage.getItem('allExpensesList')
      );
    },
    saveJson(state) {
      localStorage.setItem(
        'allExpensesList',
        JSON.stringify(state.allExpensesList)
      );
    },
    addNewExpense(state, expense) {
      state.allExpensesList.push({
        expense: expense.expense,
        amount: expense.amount,
        id: state.latestID,
        isPostponed: false
      });
    },

    updateLatestID(state) {
      let filterOutIds = state.allExpensesList.map(el => el.id);
      let highestId = Math.max(...filterOutIds);

      highestId > state.latestID
        ? (state.latestID = highestId)
        : state.latestID++;
    },

    freeze(state, index) {
      state.allExpensesList.find(
        ({ id }) => id === index.index
      ).isPostponed = true;
    },

    advance(state, index) {
      state.allExpensesList.find(
        ({ id }) => id === index.index
      ).isPostponed = false;
    },

    remove(state, index) {
      for (let i = 0; i < state.allExpensesList.length; i++) {
        if (index.index === state.allExpensesList[i].id) {
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
    totalTotal: state => {
      return state.allExpensesList.reduce(
        (accumulator, currentObject) =>
          accumulator + parseInt(currentObject.amount, 10),
        0
      );
    },
    frozenTotal: (state, getters) => {
      return getters.filterFrozen.reduce(
        (accumulator, currentObject) =>
          accumulator + parseInt(currentObject.amount, 10),
        0
      );
    },
    activeTotal: (state, getters) => {
      return getters.filterActive.reduce(
        (accumulator, currentObject) =>
          accumulator + parseInt(currentObject.amount, 10),
        0
      );
    }
  }
});
