/**
 * 移动端导航逻辑 Composable
 */
import { computed, ref } from 'vue';

export function useMobileNav(page, deviceType) {
  const itemType = ref("index");
  const itemTypeList = ['index', 'service'];
  
  // 移动端是否显示搜索输入框
  const mobileIfShowSearchInput = computed(() => {
    if (['IndexPage', 'ServicePage', 'RagChatPage'].includes(page.value)) {
      return false;
    }
    return true;
  });
  
  // 是否显示底部导航
  const ifShowBottomNav = computed(() => {
    return ['SelfPage', 'IndexPage', 'SearchPage'].includes(page.value) && deviceType.value == 'mobile';
  });
  
  // 路由下边距
  const routerMarginBottom = computed(() => {
    return ifShowBottomNav.value ? '50px' : '10px';
  });
  
  return {
    itemType,
    itemTypeList,
    mobileIfShowSearchInput,
    ifShowBottomNav,
    routerMarginBottom,
  };
}

