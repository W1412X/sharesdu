/**
 * 移动端导航逻辑 Composable
 */
import { computed, ref } from 'vue';
import { globalProperties } from '@/main';
export function useMobileNav(page, deviceType, loadState) {
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
    return ['SelfPage', 'IndexPage', 'SearchPage','ServicePage'].includes(page.value) && deviceType.value == 'mobile';
  });
  
  // 路由下边距
  const routerMarginBottom = computed(() => {
    return ifShowBottomNav.value ? '50px' : '10px';
  });
  const themeColor = globalProperties.$themeColor;
  
  // 是否显示导航栏
  const ifShowNav = computed(() => {
    if (loadState.value && ['WelcomePage', 'LoginPage', 'ChatPage', 'DocumentPage', 'DevPage', undefined, null].includes(page.value)) {
      return false;
    } else {
      return true;
    }
  });
  
  // 导航栏背景颜色
  const navColor = computed(() => {
    return "#ffffff";
  });
  
  // 导航栏图标颜色
  const navIconColor = computed(() => {
    return themeColor;
  });
  
  // 路由上边距
  const routerMarginTop = computed(() => {
    if(deviceType.value == 'mobile') {
      return '45px';
    }
    if (ifShowNav.value) {
      return '45px';
    } else {
      return '0px';
    }
  });
  
  // 是否显示首页按钮
  const ifShowHomeBtn = computed(() => {
    return page.value == "ArticlePage" || page.value == "PostPage" || page.value == "CoursePage" || 
           page.value == "SelfPage" || page.value == "ManagePage" || page.value == "EditorPage" || 
           page.value == "SearchPage" || page.value == "ErrorPage" || page.value == "AuthorPage" || 
           page.value == "ServicePage" || page.value == "RagChatPage";
  });
  
  // 是否显示头像
  const ifShowAvatar = computed(() => {
    if (page.value == "SelfPage" || page.value == 'ManagePage') {
      return false;
    } else {
      return true;
    }
  });
  
  // 是否显示顶部编辑按钮
  const ifShowTopEditBtns = computed(() => {
    return deviceType.value === 'desktop' && ['IndexPage', 'SelfPage'].includes(page.value);
  });
  
  // 是否显示服务按钮
  const ifShowService = computed(() => {
    return ['IndexPage'].includes(page.value);
  });
  
  // 是否可以显示搜索建议
  const ifCanSearchInputSuggestion = computed(() => {
    return !['SearchMobilePage'].includes(page.value);
  });
  return {
    itemType,
    itemTypeList,
    mobileIfShowSearchInput,
    ifShowBottomNav,
    routerMarginBottom,
    themeColor,
    ifShowNav,
    navColor,
    navIconColor,
    routerMarginTop,
    ifShowHomeBtn,
    ifShowAvatar,
    ifShowTopEditBtns,
    ifShowService,
    ifCanSearchInputSuggestion,
  };
}

