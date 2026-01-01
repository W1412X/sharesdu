/**
 * DeveloperPage 数据管理 Composable
 */
import { ref, computed } from 'vue';

export function useDeveloperData() {
  const categoryList = ref([]);
  const categoryLoading = ref(true);
  const data = ref({
    type: 'md',
    content: '## 正在加载...',
  });
  const isLoading = ref(false);
  
  // 扁平化文档列表（用于移动端选择器和导航）
  const flattenedDocList = computed(() => {
    const flatten = (items, result = []) => {
      items.forEach(item => {
        if (item.file) {
          result.push({
            key: item.key,
            title: item.title,
            file: item.file,
          });
        }
        if (item.children) {
          flatten(item.children, result);
        }
      });
      return result;
    };
    return flatten(categoryList.value);
  });
  
  // 获取相邻文档（上一个和下一个）
  const getAdjacentDocs = (currentKey) => {
    const flatList = flattenedDocList.value;
    const currentIndex = flatList.findIndex(doc => doc.key === currentKey);
    
    if (currentIndex === -1) {
      return { prevDoc: null, nextDoc: null };
    }
    
    return {
      prevDoc: currentIndex > 0 ? flatList[currentIndex - 1] : null,
      nextDoc: currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null,
    };
  };
  
  return {
    categoryList,
    categoryLoading,
    data,
    flattenedDocList,
    getAdjacentDocs,
    isLoading,
  };
}

