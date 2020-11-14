/* eslint-disable no-console */
import { mount } from '@vue/test-utils';
import Vue from 'vue';
import component from '../../src/components/List.vue';

describe('Tests for component', () => {
  const wrapper = mount(component, { attachToDocument: true });
  const form = wrapper.find('.fr__form');
  const expenseInput = wrapper.find('#expense');
  const amountInput = wrapper.find('#amount');

  it('add new expense to the list', async () => {
    expenseInput.setValue('Kanelbulle');
    amountInput.setValue(15);
    form.trigger('submit');

    await Vue.nextTick();

    expect(wrapper.vm.$data.expenseList[0].expense).toBe('Kanelbulle');
    expect(wrapper.vm.$data.expenseList[0].amount).toBe('15');
  });
  it('clear form after adding expense', () => {
    expect(expenseInput.text()).toBe('');
    expect(amountInput.text()).toBe('');
  });
  it('freeze and unfreeze one expense on the list', async () => {
    expenseInput.setValue('Kaffe');
    amountInput.setValue(25);
    form.trigger('submit');

    await Vue.nextTick();
    wrapper.findAll('.fr__button--postpone').at(1).trigger('click');

    wrapper.find('.fr__button--postpone').trigger('click');
    await Vue.nextTick();
  });
  it('remove one expense from the list', async () => {
    wrapper.find('.fr__button--expedite').trigger('click');
    await Vue.nextTick();
  });
  it('save the list to local storage', () => { });
  it('retrieve the list from local storage', () => { });
});
