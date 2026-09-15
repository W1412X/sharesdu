import { mount } from '@vue/test-utils';
import HistoryCard from '@/components/common/searchInput/utils/HistoryCard.vue';
import { selfDefineLocalStorage } from '@/utils/localStorage';
import { getSearchHistory } from '@/components/common/searchInput/js/utils';
import { createEventBus, deleteEventBus } from '@/utils/eventBus';

const entries = ['Campus events', 'Course reviews'];
const mountHistory = (props = {}) => mount(HistoryCard, {
  props,
  global: { stubs: { 'v-icon': true } },
});

describe('HistoryCard', () => {
  beforeEach(() => {
    selfDefineLocalStorage.setItem('searchHistory', JSON.stringify(entries));
  });

  afterEach(() => {
    selfDefineLocalStorage.removeItem('searchHistory');
  });

  test('fills the selected query', async () => {
    const wrapper = mountHistory();
    await wrapper.find('.history-btn').trigger('click');
    expect(wrapper.emitted('fill-search-input')).toEqual([[entries[0]]]);
    wrapper.unmount();
  });

  test('deletes and persists history without selecting the query', async () => {
    const wrapper = mountHistory();
    await wrapper.find('.delete-history-btn').trigger('click');

    expect(wrapper.emitted('fill-search-input')).toBeUndefined();
    expect(getSearchHistory()).toEqual([entries[1]]);
    expect(wrapper.findAll('.history-btn').map((button) => button.text())).toEqual([entries[1]]);

    await wrapper.find('.delete-history-btn').trigger('click');
    expect(getSearchHistory()).toEqual([]);
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    wrapper.unmount();
  });

  test('preserves selection through the mobile search event bus', async () => {
    const bus = createEventBus('global-search-input');
    const fill = jest.fn();
    bus.on('fill-search-input', fill);
    const wrapper = mountHistory({ inputStyle: { width: '100vw' } });

    await wrapper.find('.history-btn').trigger('click');
    expect(fill).toHaveBeenCalledWith(entries[0]);
    expect(wrapper.emitted('fill-search-input')).toBeUndefined();
    wrapper.unmount();
    deleteEventBus('global-search-input');
  });
});
