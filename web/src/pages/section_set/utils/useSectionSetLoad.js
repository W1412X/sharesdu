/**
 * SectionSetPage 加载逻辑 Composable
 */
import { getSectionList } from '@/api/modules/manage';
import { getNormalErrorAlert } from '@/utils/other';

export function useSectionSetLoad(
  sectionList,
  loading,
  allLoad,
  setSections,
  addSections,
  alert
) {
  /**
   * 刷新数据
   * @returns {Promise} 刷新完成
   */
  const refresh = async () => {
    loading.value = true;
    try {
      const response = await getSectionList();
      if (response.status === 200 || response.status === 201) {
        setSections(response.section_articles || []);
        allLoad.value = true; // 板块列表一次性加载完
      } else {
        alert(getNormalErrorAlert(response.message || '加载板块列表失败'));
      }
    } catch (error) {
      alert(getNormalErrorAlert('加载板块列表失败'));
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载更多数据（板块列表通常不需要分页，但保留接口）
   */
  const loadMore = async () => {
    if (allLoad.value) {
      return;
    }
    
    loading.value = true;
    try {
      const response = await getSectionList();
      if (response.status === 200 || response.status === 201) {
        addSections(response.section_articles || []);
        allLoad.value = true; // 板块列表一次性加载完
        // 列表加载成功不显示通知
      } else {
        alert(getNormalErrorAlert(response.message || '加载板块列表失败'));
      }
    } catch (error) {
      alert(getNormalErrorAlert('加载板块列表失败'));
    } finally {
      loading.value = false;
    }
  };

  return {
    refresh,
    loadMore,
  };
}

