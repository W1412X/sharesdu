import { mount } from '@vue/test-utils';
import SearchInput from '@/components/common/searchInput/SearchInput.vue';

jest.mock('@/components/common/searchInput/utils/HistoryCard.vue', () => ({
  name: 'HistoryCard',
  template: '<div />',
}));

jest.mock('@/components/common/searchInput/utils/RecommendCard.vue', () => ({
  name: 'RecommendCard',
  template: '<div />',
}));

describe('SearchInput', () => {
  test('按 Enter 时只提交一次搜索', async () => {
    const wrapper = mount(SearchInput, {
      props: {
        modelValue: '测试内容',
      },
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });

    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('submit')).toHaveLength(1);
    wrapper.unmount();
  });

  test('仅在搜索框聚焦时显示搜索建议', async () => {
    const wrapper = mount(SearchInput, {
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });
    const input = wrapper.find('input');
    const suggestions = wrapper.find('.suggestion-container');

    expect(suggestions.isVisible()).toBe(false);

    await input.trigger('focusin');
    expect(suggestions.isVisible()).toBe(true);

    await input.trigger('focusout');
    expect(suggestions.isVisible()).toBe(false);
    wrapper.unmount();
  });

  test('提交搜索后失焦并在重新聚焦时显示建议', async () => {
    const eventOrder = [];
    const wrapper = mount(SearchInput, {
      attachTo: document.body,
      props: {
        modelValue: '测试内容',
        onSubmit: () => eventOrder.push('submit'),
        onBlur: () => eventOrder.push('blur'),
      },
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });
    const input = wrapper.find('input');
    const suggestions = wrapper.find('.suggestion-container');

    input.element.focus();
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(input.element);

    await input.trigger('keydown', { key: 'Enter' });
    expect(eventOrder).toEqual(['submit', 'blur']);
    expect(document.activeElement).not.toBe(input.element);
    expect(suggestions.isVisible()).toBe(false);

    await input.setValue('新的内容');
    expect(suggestions.isVisible()).toBe(false);

    input.element.focus();
    await wrapper.vm.$nextTick();
    expect(suggestions.isVisible()).toBe(true);
    wrapper.unmount();
  });

  test('输入其他按键时不提交搜索', async () => {
    const wrapper = mount(SearchInput, {
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });

    await wrapper.find('input').trigger('keydown', { key: 'a' });

    expect(wrapper.emitted('submit')).toBeUndefined();
    wrapper.unmount();
  });
});
