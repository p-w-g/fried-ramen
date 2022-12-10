import { createStore } from 'vuex';
import { expenseModel } from '../models';
import { labels_list, expense_list, expense_model } from '../interfaces';
import * as actions from './actions';
import * as mutations from './mutations';

export default createStore({
  actions,
  mutations,
  state: {
    latestID: 0,
    labels: [], // deprecated, awaiting removal
    labels_list: {} as labels_list,
    allExpensesList: Array<expenseModel>(), // deprecated, awaiting removal
    expense_lists: {} as expense_list,
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
     * https://vuex.vuejs.org/guide/getters.html#method-style-access
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
     * https://vuex.vuejs.org/guide/getters.html#method-style-access
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
     * https://vuex.vuejs.org/guide/getters.html#method-style-access
     */
    labelsForList: (state, list): string[] => {
      return state.labels_list[list];
    },
  },
});
