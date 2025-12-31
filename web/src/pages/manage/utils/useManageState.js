/**
 * ManagePage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

export function useManageState() {
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 设备类型
  const deviceType = globalProperties.$deviceType;
  
  // 导航状态
  const drawer = ref(true);
  const rail = ref(true);
  const navVisible = ref(false);
  const choose = ref('user'); // 'user' | 'user-list' | 'article' | 'section-list' | 'course' | 'invite'
  
  // 对话框状态
  const ifShowWebCard = ref(false);
  const ifShowCourseHistory = ref(false);
  const ifShowDialog = computed(() => {
    return ifShowWebCard.value || ifShowCourseHistory.value;
  });
  
  // 列表显示状态
  const ifShowUserList = ref(false);
  const ifShowBlockUserList = ref(false);
  
  /**
   * 设置 WebCard 状态
   * @param {Boolean} state - 是否显示
   */
  const setWebCardState = (state) => {
    ifShowWebCard.value = state;
  };
  
  /**
   * 设置课程历史状态
   * @param {Boolean} state - 是否显示
   */
  const setCourseHistoryState = (state) => {
    ifShowCourseHistory.value = state;
  };
  
  /**
   * 设置用户列表状态
   * @param {Boolean} state - 是否显示
   */
  const setUserListState = (state) => {
    ifShowUserList.value = state;
    if (state) {
      ifShowBlockUserList.value = false;
    }
  };
  
  /**
   * 设置封禁用户列表状态
   * @param {Boolean} state - 是否显示
   */
  const setBlockUserListState = (state) => {
    ifShowBlockUserList.value = state;
    if (state) {
      ifShowUserList.value = false;
    }
  };
  
  return {
    themeColor,
    deviceType,
    drawer,
    rail,
    navVisible,
    choose,
    ifShowWebCard,
    ifShowCourseHistory,
    ifShowDialog,
    ifShowUserList,
    ifShowBlockUserList,
    setWebCardState,
    setCourseHistoryState,
    setUserListState,
    setBlockUserListState,
  };
}

