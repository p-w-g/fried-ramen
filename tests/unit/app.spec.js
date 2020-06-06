import { mount } from '@vue/test-utils';
import component from '../../src/components/List.vue';

describe('Tests for component', () => {
  const wrapper = mount(component);
  it('exists', () => {
    expect(wrapper.exists).toBe(true);
  });
});
