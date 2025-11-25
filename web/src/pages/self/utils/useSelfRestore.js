/**
 * SelfPage 状态恢复 Composable
 */
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { getCookie } from '@/utils/cookie';

export function useSelfRestore() {
  /**
   * 保存状态
   * @param {Object} state - 状态对象
   */
  const saveState = (state) => {
    try {
      if (!getCookie('userName')) {
        return;
      }
      const scanMsg = {
        scrollTop: state.scrollTop || document.scrollingElement.scrollTop,
        choose: state.choose,
      };
      const key = 'selfScanMsg';
      selfDefinedSessionStorage.setItem(key, JSON.stringify(scanMsg));
    } catch (e) {
      console.error('Failed to save self page state:', e);
    }
  };
  
  /**
   * 恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      const scanMsg = selfDefinedSessionStorage.getItem('selfScanMsg');
      if (scanMsg) {
        return JSON.parse(scanMsg);
      }
    } catch (e) {
      console.error('Failed to restore self page state:', e);
    }
    return null;
  };
  
  /**
   * 恢复滚动位置
   * @param {Number} scrollTop - 滚动位置
   */
  const restoreScrollPosition = (scrollTop) => {
    if (scrollTop > 0) {
      setTimeout(() => {
        document.scrollingElement.scrollTop = scrollTop;
      }, 10);
    }
  };
  
  /**
   * 初始化用户信息
   * @returns {Object} 用户信息对象
   */
  const initUser = () => {
    return {
      id: getCookie('userId'),
      name: getCookie('userName'),
      email: getCookie('email'),
      passwd: '********',
      profileUrl: getCookie('userProfileUrl'),
    };
  };
  
  return {
    saveState,
    restoreState,
    restoreScrollPosition,
    initUser,
  };
}

