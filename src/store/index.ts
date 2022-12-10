import { createStore } from 'vuex';
import { expenseModel } from '../models';
import { labels_list, expense_list } from '../interfaces';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

const state = {
  latestID: 0,
  labels: [] as string[], // deprecated, awaiting removal
  labels_list: {} as labels_list,
  allExpensesList: Array<expenseModel>(), // deprecated, awaiting removal
  expense_lists: {} as expense_list,
};

export default createStore({
  actions,
  mutations,
  getters,
  state,
});
