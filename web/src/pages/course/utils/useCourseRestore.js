/**
 * CoursePage 页面恢复机制 Composable
 * 优化后的页面状态恢复逻辑
 */
import { ref } from 'vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { getCookie } from '@/utils/cookie';

// 状态过期时间（毫秒）- 30分钟
const STATE_EXPIRE_TIME = 30 * 60 * 1000;

export function useCourseRestore(courseId) {
  const isRestoring = ref(false);
  const restoreComplete = ref(false);
  
  /**
   * 生成存储 key
   */
  const getStorageKey = () => {
    return `courseScanMsg|${courseId.value || ''}`;
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
      
      // 检查状态是否过期（如果有时间戳）
      if (scanMsg.timestamp) {
        const now = Date.now();
        if (now - scanMsg.timestamp > STATE_EXPIRE_TIME) {
          // 状态已过期，清除
          selfDefinedSessionStorage.removeItem(key);
          return null;
        }
      }

      // 验证状态完整性
      if (!scanMsg.pageNum) {
        return null;
      }

      return {
        pageNum: scanMsg.pageNum || {
          post: 1,
          comment: 1,
        },
        scrollTop: scanMsg.scrollTop || 0,
        postState: scanMsg.postState || false,
        postScrollTop: scanMsg.postScrollTop || 0,
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
        pageNum: state.pageNum || {
          post: 1,
          comment: 1,
        },
        scrollTop: state.scrollTop || 0,
        postState: state.postState || false,
        postScrollTop: state.postScrollTop || 0,
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
   * 获取目标页码
   * @param {Object} savedPageNum - 保存的页码
   * @param {String} type - 类型（post/comment）
   * @returns {Number} 目标页码
   */
  const getTargetPageNum = (savedPageNum, type) => {
    if (!savedPageNum || !savedPageNum[type]) {
      return 1;
    }
    return savedPageNum[type];
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

