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

  test('keeps suggestions open while keyboard focus moves inside the panel', async () => {
    const wrapper = mount(SearchInput, {
      attachTo: document.body,
      global: {
        stubs: {
          HistoryCard: { template: '<button type="button">History</button>' },
        },
      },
    });
    wrapper.find('input').element.focus();
    await wrapper.vm.$nextTick();
    const button = wrapper.find('button');
    button.element.focus();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.suggestion-container').isVisible()).toBe(true);
    expect(wrapper.emitted('blur')).toBeUndefined();

    button.element.blur();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.suggestion-container').isVisible()).toBe(false);
    expect(wrapper.emitted('blur')).toHaveLength(1);
    wrapper.unmount();
  });

  test('Escape returns focus to the input and hides suggestions until typing resumes', async () => {
    const wrapper = mount(SearchInput, {
      attachTo: document.body,
      global: {
        stubs: {
          HistoryCard: { template: '<button type="button">History</button>' },
        },
      },
    });
    const input = wrapper.find('input');
    input.element.focus();
    await wrapper.vm.$nextTick();
    const button = wrapper.find('button');
    button.element.focus();
    await button.trigger('keydown', { key: 'Escape' });

    expect(document.activeElement).toBe(input.element);
    expect(wrapper.find('.suggestion-container').isVisible()).toBe(false);
    expect(wrapper.emitted('submit')).toBeUndefined();

    await input.setValue('Another query');
    expect(wrapper.find('.suggestion-container').isVisible()).toBe(true);
    wrapper.unmount();
  });

  test('does not open or join the panel when suggestions are disabled', async () => {
    const wrapper = mount(SearchInput, {
      props: { canSuggestion: false, inputStyle: { borderRadius: '20px' } },
    });
    await wrapper.find('input').trigger('focusin');

    expect(wrapper.find('.suggestion-container').isVisible()).toBe(false);
    expect(wrapper.classes()).not.toContain('suggestions-open');
    expect(wrapper.find('input').element.style.borderRadius).toBe('20px');
    wrapper.unmount();
  });
});
