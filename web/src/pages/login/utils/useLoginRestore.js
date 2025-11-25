/**
 * LoginPage 状态恢复 Composable
 */
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { selfDefineLocalStorage } from '@/utils/localStorage';

export function useLoginRestore() {
  /**
   * 保存状态
   * @param {Object} state - 状态对象
   */
  const saveState = (state) => {
    try {
      const msg = {
        loginByUsernameData: state.loginByUsernameData,
        loginByEmailData: state.loginByEmailData,
        registerByEmailData: state.registerByEmailData,
        registerByInviteData: state.registerByInviteData,
        loginMethod: state.loginMethod,
        registerMethod: state.registerMethod,
        registerByEmailStep: state.registerByEmailStep,
        registerByInviteStep: state.registerByInviteStep,
        ifShowEmailExamineCard: state.ifShowEmailExamineCard,
        nowTab: state.nowTab,
      };
      selfDefinedSessionStorage.setItem('loginMsg', JSON.stringify(msg));
    } catch (e) {
      console.error('Failed to save login state:', e);
    }
  };
  
  /**
   * 恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      const msg = selfDefinedSessionStorage.getItem('loginMsg');
      if (msg) {
        return JSON.parse(msg);
      }
    } catch (e) {
      console.error('Failed to restore login state:', e);
    }
    return null;
  };
  
  /**
   * 恢复初始化数据（从 localStorage 或 props）
   * @param {Object} props - 组件 props
   * @param {Object} loginByUsernameData - 登录数据引用
   */
  const restoreInitialData = (props, loginByUsernameData) => {
    // 从 props 恢复
    if (props.name) {
      loginByUsernameData.value.userName = props.name;
    }
    if (props.passwd) {
      loginByUsernameData.value.passwd = props.passwd;
    }
    
    // 从 localStorage 恢复
    if (selfDefineLocalStorage.getItem('passwd')) {
      loginByUsernameData.value.userName = selfDefineLocalStorage.getItem('userName');
      loginByUsernameData.value.passwd = selfDefineLocalStorage.getItem('passwd');
    }
  };
  
  return {
    saveState,
    restoreState,
    restoreInitialData,
  };
}

