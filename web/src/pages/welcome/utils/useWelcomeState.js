/**
 * WelcomePage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

export function useWelcomeState() {
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 设备类型
  const deviceType = globalProperties.$deviceType;
  
  // 对话框状态
  const ifShowLogin = ref(false);
  const ifShowContact = ref(false);
  const ifShowDownload = ref(false);
  const ifShowDialog = computed(() => {
    return ifShowLogin.value || ifShowContact.value || ifShowDownload.value;
  });
  
  /**
   * 设置登录对话框状态
   * @param {Boolean} state - 是否显示
   */
  const setLoginState = (state) => {
    ifShowLogin.value = state;
  };
  
  /**
   * 设置联系对话框状态
   * @param {Boolean} state - 是否显示
   */
  const setContactState = (state) => {
    ifShowContact.value = state;
  };
  
  /**
   * 设置下载对话框状态
   * @param {Boolean} state - 是否显示
   */
  const setDownloadState = (state) => {
    ifShowDownload.value = state;
  };
  
  return {
    themeColor,
    deviceType,
    ifShowLogin,
    ifShowContact,
    ifShowDownload,
    ifShowDialog,
    setLoginState,
    setContactState,
    setDownloadState,
  };
}

