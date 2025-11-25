/**
 * SearchPage 页面恢复机制 Composable
 * 优化后的页面状态恢复逻辑
 */
import { ref } from 'vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { getCookie } from '@/utils/cookie';

// 状态过期时间（毫秒）- 30分钟
const STATE_EXPIRE_TIME = 30 * 60 * 1000;

export function useSearchRestore(query) {
  const isRestoring = ref(false);
  const restoreComplete = ref(false);
  
  /**
   * 生成存储 key
   */
  const getStorageKey = () => {
    const queryStr = Array.isArray(query.value) ? query.value.join(',') : '';
    return `searchScanMsg|${queryStr}`;
  };
  
  /**
   * 从 sessionStorage 恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      const key = getStorageKey();
      const stored = selfDefinedSessionStorage.getItem(key);
      if (!stored) {
        return null;
      }

      const scanMsg = JSON.parse(stored);
      
      // 检查状态是否过期
      if (scanMsg.timestamp) {
        const now = Date.now();
        if (now - scanMsg.timestamp > STATE_EXPIRE_TIME) {
          // 状态已过期，清除
          selfDefinedSessionStorage.removeItem(key);
          return null;
        }
      }

      // 验证状态完整性
      if (!scanMsg.searchType) {
        return null;
      }

      return {
        editingArticleFiltTag: scanMsg.editingArticleFiltTag || '',
        courseCollege: scanMsg.courseCollege || '全部',
        courseMethod: scanMsg.courseMethod || '全部',
        courseType: scanMsg.courseType || '全部',
        searchType: scanMsg.searchType || '全部',
        ifCourseFilter: scanMsg.ifCourseFilter || false,
        ifArticleFilter: scanMsg.ifArticleFilter || false,
        filtArticleTags: scanMsg.filtArticleTags || [],
        sortType: scanMsg.sortType,
        articleType: scanMsg.articleType || null,
        pageNum: scanMsg.pageNum || null,
        scrollTop: scanMsg.scrollTop || 0,
        timestamp: scanMsg.timestamp,
      };
    } catch (e) {
      console.error('Failed to restore state:', e);
      // 清除损坏的状态
      try {
        selfDefinedSessionStorage.removeItem(getStorageKey());
      } catch (err) {
        console.error('Failed to clear corrupted state:', err);
      }
      return null;
    }
  };

  /**
   * 保存状态到 sessionStorage
   * @param {Object} state - 要保存的状态
   */
  const saveState = (state) => {
    try {
      // 未登录用户不保存状态
      if (!getCookie('userName')) {
        return;
      }

      const stateToSave = {
        editingArticleFiltTag: state.editingArticleFiltTag || '',
        courseCollege: state.courseCollege || '全部',
        courseMethod: state.courseMethod || '全部',
        courseType: state.courseType || '全部',
        searchType: state.searchType || '全部',
        ifCourseFilter: state.ifCourseFilter || false,
        ifArticleFilter: state.ifArticleFilter || false,
        filtArticleTags: state.filtArticleTags || [],
        sortType: state.sortType,
        articleType: state.articleType || null,
        pageNum: state.pageNum,
        scrollTop: state.scrollTop || 0,
        timestamp: Date.now(), // 添加时间戳
      };

      selfDefinedSessionStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };

  /**
   * 清除保存的状态
   */
  const clearState = () => {
    try {
      selfDefinedSessionStorage.removeItem(getStorageKey());
    } catch (e) {
      console.error('Failed to clear state:', e);
    }
  };

  /**
   * 检查是否需要恢复状态
   * @param {Object} restoredState - 恢复的状态
   * @returns {Boolean}
   */
  const shouldRestore = (restoredState) => {
    return restoredState !== null && restoredState.pageNum;
  };

  /**
   * 计算需要加载的页码范围
   * @param {String} searchType - 搜索类型
   * @param {String} sortType - 排序类型
   * @param {Object} savedPageNum - 保存的页码
   * @param {Object} currentPageNum - 当前页码
   * @returns {Number} 需要加载到的目标页码
   */
  // eslint-disable-next-line no-unused-vars
  const getTargetPageNum = (searchType, sortType, savedPageNum, currentPageNum) => {
    if (!savedPageNum || !savedPageNum[searchType]) {
      return 1;
    }
    
    return savedPageNum[searchType][sortType] || 1;
  };

  return {
    isRestoring,
    restoreComplete,
    restoreState,
    saveState,
    clearState,
    shouldRestore,
    getTargetPageNum,
  };
}
