/**
 * IndexPage 页面恢复机制 Composable
 * 优化后的页面状态恢复逻辑
 */
import { ref } from 'vue';
import stateStorage from '@/utils/stateStorage';
import { getCookie } from '@/utils/cookie';

// 状态过期时间（毫秒）- 30分钟
const STATE_EXPIRE_TIME = 30 * 60 * 1000;

export function useIndexRestore() {
  const isRestoring = ref(false);
  const restoreComplete = ref(false);

  /**
   * 从 sessionStorage 恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      const stored = stateStorage.getItem('indexScanMsg');
      if (!stored) {
        return null;
      }

      const lastScanMsg = JSON.parse(stored);
      
      // 检查状态是否过期
      if (lastScanMsg.timestamp) {
        const now = Date.now();
        if (now - lastScanMsg.timestamp > STATE_EXPIRE_TIME) {
          // 状态已过期，清除
          stateStorage.removeItem('indexScanMsg');
          return null;
        }
      }

      // 验证状态完整性
      if (!lastScanMsg.itemType || !lastScanMsg.pageNum) {
        return null;
      }

      return {
        itemType: lastScanMsg.itemType || 'article',
        pageNum: lastScanMsg.pageNum,
        scrollPosition: lastScanMsg.scrollPosition || 0,
        articleSortMethod: lastScanMsg.articleSortMethod || 'time',
        selectedSectionId: lastScanMsg.selectedSectionId || 20,
        timestamp: lastScanMsg.timestamp,
      };
    } catch (e) {
      console.error('Failed to restore state:', e);
      // 清除损坏的状态
      try {
        stateStorage.removeItem('indexScanMsg');
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
        itemType: state.itemType,
        pageNum: state.pageNum,
        scrollPosition: state.scrollPosition || 0,
        articleSortMethod: state.articleSortMethod || 'time',
        selectedSectionId: state.selectedSectionId || 20,
        timestamp: Date.now(), // 添加时间戳
      };

      stateStorage.setItem('indexScanMsg', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };

  /**
   * 清除保存的状态
   */
  const clearState = () => {
    try {
      stateStorage.removeItem('indexScanMsg');
    } catch (e) {
      console.error('Failed to clear state:', e);
    }
  };

  /**
   * 计算需要加载的页码范围
   * @param {String} type - 内容类型
   * @param {Object} savedPageNum - 保存的页码
   * @param {Object} currentPageNum - 当前页码
   * @param {String} articleSortMethod - 文章排序方式（仅用于文章类型）
   * @returns {Number} 需要加载到的目标页码
   */
  const getTargetPageNum = (type, savedPageNum, currentPageNum, articleSortMethod = 'time') => {
    if (!savedPageNum) {
      return 1;
    }

    switch (type) {
      case 'article':
        return savedPageNum.article?.[articleSortMethod] || 1;
      case 'post':
        return savedPageNum.post || 1;
      case 'course':
        return savedPageNum.course || 1;
      default:
        return 1;
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

  return {
    isRestoring,
    restoreComplete,
    restoreState,
    saveState,
    clearState,
    getTargetPageNum,
    shouldRestore,
  };
}


