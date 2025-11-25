/**
 * SelfPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

export function useSelfState() {
  // 导航抽屉状态
  const drawer = ref(true);
  const rail = ref(true);
  const navVisible = ref(false);
  
  // 当前选中的标签
  const choose = ref('info');
  
  // 设备类型和主题颜色
  const deviceType = globalProperties.$deviceType;
  const themeColor = globalProperties.$themeColor;
  
  // 项目类型
  const selfItemType = ref('article');
  
  // 对话框状态
  const ifShowBlockList = ref(false);
  const ifShowColorSelectorCard = ref(false);
  const ifShowDialog = computed(() => {
    return ifShowBlockList.value || ifShowColorSelectorCard.value;
  });
  
  /**
   * 设置黑名单列表状态
   * @param {Boolean} state - 是否显示
   */
  const setBlockListState = (state) => {
    ifShowBlockList.value = state;
  };
  
  /**
   * 设置颜色选择器卡片状态
   * @param {Boolean} state - 是否显示
   */
  const setColorSelectorCardState = (state) => {
    ifShowColorSelectorCard.value = state;
  };
  
  return {
    drawer,
    rail,
    navVisible,
    choose,
    deviceType,
    themeColor,
    selfItemType,
    ifShowBlockList,
    ifShowColorSelectorCard,
    ifShowDialog,
    setBlockListState,
    setColorSelectorCardState,
  };
}

