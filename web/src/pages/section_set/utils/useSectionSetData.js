/**
 * SectionSetPage 数据管理 Composable
 */
import { ref } from 'vue';
import { transformSectionList } from './dataTransformers';

export function useSectionSetData() {
  // 板块列表
  const sectionList = ref([]);

  // 加载状态
  const loading = ref(false);

  // 是否全部加载完成
  const allLoad = ref(false);

  /**
   * 设置板块列表
   * @param {Array} sections - 板块数组
   */
  const setSections = (sections) => {
    sectionList.value = transformSectionList(sections);
  };

  /**
   * 添加板块到列表
   * @param {Array} sections - 板块数组
   */
  const addSections = (sections) => {
    const transformed = transformSectionList(sections);
    sectionList.value.push(...transformed);
  };

  return {
    sectionList,
    loading,
    allLoad,
    setSections,
    addSections,
  };
}

