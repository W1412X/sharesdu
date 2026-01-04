<!-- src/AppMobile.vue - 移动端版本 -->
<template>
  <v-app style="display: flex;height: 100vh;flex-direction: column;">
    <!-- 启动画面 -->
    <splash-screen :show="showSplash"></splash-screen>
    <loading-view :init-data="loadMsg" class="z-index-loading absolute-position">
    </loading-view>
    <global-message :alert-msg="alertMsg" @close="closeMessage"></global-message>
    <!-- 特殊页面导航栏（帖子、文章、课程） -->
    <div v-if="isSpecialPage && ifShowNav" class="nav-bar special-nav-bar" :style="{ 'background-color': navColor }">
      <!-- 返回按钮 -->
      <div v-if="!showSpecialSearchInput" class="nav-btn-container">
        <v-btn @click="goBack" icon="mdi-chevron-left" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-chevron-left" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
        <v-btn @click="toHomePage" style="margin-left: 10px;" icon="mdi-home" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-home" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <!-- 搜索框（当显示时） -->
      <search-input v-show="showSpecialSearchInput" id="search-box-listen-special" v-model="searchContent"
        :borderColor="navIconColor" :can-suggestion="ifCanSearchInputSuggestion"
        :boxShadowColor="hexToRgba(navIconColor, 0.5)" :placeholderColor="navIconColor"
        @blur="handleSpecialSearchBlur"
        :inputStyle="{ 'font-color': navIconColor, 'border-radius': '20px', height: '35px', width: '60vw', 'padding-left': '15px' }"></search-input>
      <!-- 搜索按钮 -->
      <div class="nav-btn-container">
        <v-btn @click="handleSpecialSearchClick" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer v-if="showSpecialSearchInput"></v-spacer>
      <!-- 更多按钮 -->
      <div v-show="!showSpecialSearchInput" class="nav-btn-container">
        <v-btn icon="mdi-dots-vertical" variant="text" :color="navIconColor" @click="openBottomActionMenu" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-dots-vertical" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
    </div>
    
    <!-- 普通页面导航栏 -->
    <div v-else-if="ifShowNav" class="nav-bar" :style="{ 'background-color': navColor }">
      <div v-show="!mobileIfShowSearchInput" class="search-btn-container">
        <v-btn @click="openCreateSheet" icon="mdi-plus" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-plus" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <search-input v-show="mobileIfShowSearchInput" id="search-box-listen" v-model="searchContent"
        :borderColor="navIconColor" :can-suggestion="ifCanSearchInputSuggestion"
        :boxShadowColor="hexToRgba(navIconColor, 0.5)" :placeholderColor="navIconColor"
        @blur="handleDetailPageSearchBlur"
        :inputStyle="{ 'font-color': navIconColor, 'border-radius': '20px', height: '35px', width: '60vw', 'padding-left': '15px' }"></search-input>
      <div v-show="mobileIfShowSearchInput" class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn v-if="ifShowHomeBtn && !ifShowBottomNav && mobileIfShowSearchInput" @click="toHomePage" icon="mdi-home" variant="text" size="38"
        :color="navIconColor">
        <div class="icon-container">
          <v-icon type="mdi" icon="mdi-home" :color="navIconColor" size="25"></v-icon>
        </div>
        <v-tooltip activator="parent">返回首页</v-tooltip>
      </v-btn>
      <div v-show="!mobileIfShowSearchInput" class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
    </div>
    <div
      id="router-view-container"
      :style="{ 'width': '100vw', 'max-width': '100vw', 'margin-top': routerMarginTop, background: '#ffffff', 'margin-bottom': routerMarginBottom, 'flex': 1 ,'overflow-y': 'auto'}">
      <router-view id="router-view" :key="$route.fullPath" class="router-view" @alert="alert" @set_loading="setLoading"
        @search_type_changed="handleSearchTypeChanged" />
    </div>
    <div v-if="ifShowBottomNav" class="bottom-nav-container">
      <v-spacer />
      <v-btn @click="openUrl('#/index')" variant="text" icon="mdi-home" :color="themeColor" size="40" :class="{ 'bottom-nav-btn--active': isIndexActive }" class="bottom-nav-btn" :style="isIndexActive ? { backgroundColor: activeBgColor } : {}"></v-btn>
      <v-spacer />
      <v-btn @click="openUrl('#/service')" icon="mdi-view-grid" variant="text" :color="themeColor" size="40" :class="{ 'bottom-nav-btn--active': isServiceActive }" class="bottom-nav-btn" :style="isServiceActive ? { backgroundColor: activeBgColor } : {}"></v-btn>
      <v-spacer />
      <v-btn @click="openUrl('#/self')" icon="mdi-account" variant="text" :color="themeColor" size="40" :class="{ 'bottom-nav-btn--active': isSelfActive }" class="bottom-nav-btn" :style="isSelfActive ? { backgroundColor: activeBgColor } : {}"></v-btn>
      <v-spacer />
    </div>
    <!-- 创作选择底部弹出 -->
    <v-bottom-sheet v-model="showCreateSheet" class="create-sheet">
      <v-sheet class="create-sheet-content">
        <div class="create-sheet-header">
          <div class="create-sheet-title">选择创作方式</div>
          <v-btn icon="mdi-close" variant="text" @click="showCreateSheet = false" size="small"></v-btn>
        </div>
        <div class="create-options">
          <v-card class="create-option-card" @click="handleCreate('post')" variant="text">
            <div class="create-option-content">
              <div class="create-option-icon" :style="{ backgroundColor: hexToRgba(themeColor, 0.1) }">
                <v-icon icon="mdi-comment-question-outline" size="32" :color="themeColor"></v-icon>
              </div>
              <div class="create-option-text">发布帖子</div>
            </div>
          </v-card>
          <v-card class="create-option-card" @click="handleCreate('course')" variant="text">
            <div class="create-option-content">
              <div class="create-option-icon" :style="{ backgroundColor: hexToRgba(themeColor, 0.1) }">
                <v-icon icon="mdi-book-plus-outline" size="32" :color="themeColor"></v-icon>
              </div>
              <div class="create-option-text">创建课程</div>
            </div>
          </v-card>
          <v-card class="create-option-card" @click="handleCreate('article')" variant="text">
            <div class="create-option-content">
              <div class="create-option-icon" :style="{ backgroundColor: hexToRgba(themeColor, 0.1) }">
                <v-icon icon="mdi-file-edit-outline" size="32" :color="themeColor"></v-icon>
              </div>
              <div class="create-option-text">创作文章</div>
            </div>
          </v-card>
        </div>
      </v-sheet>
    </v-bottom-sheet>
    <bottom-action-menu v-model="ifShowBottomActionMenu" @alert="alert" @set_loading="setLoading"></bottom-action-menu>
  </v-app>
</template>
<script>
import LoadingView from '@/components/common/LoadingView.vue';
import SplashScreen from '@/components/common/SplashScreen.vue';
import GlobalMessage from '@/components/common/GlobalMessage.vue';
import SearchInput from './components/common/searchInput/SearchInput.vue';
import BottomActionMenu from '@/components/common/BottomActionMenu/BottomActionMenu.vue';
import { hexToRgba, openPage } from './utils/other';
import {
  useRouteState,
  useUser,
  useSearch,
  useMobileNav,
  useNotificationPolling,
} from './app/composables';
import { inject, computed, ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getCookie } from './utils/cookie';

export default {
  name: 'AppMobile',
  setup() {
    // 设备类型
    const deviceType = { value: 'mobile' };
    const ifMobile = { value: true };
    
    // 路由
    const router = useRouter();
    const route = useRoute();
    
    // 启动画面状态
    const showSplash = ref(false);
    
    // 路由状态
    const { page, ifAvatarState } = useRouteState();
    
    // 特殊页面状态
    const isSpecialPage = computed(() => {
      return ['PostPage', 'ArticlePage', 'CoursePage', 'SectionPage'].includes(page.value);
    });
    
    // 特殊页面搜索框状态
    const showSpecialSearchInput = ref(false);
    
    // 切换特殊页面搜索框显示
    const toggleSpecialSearchInput = () => {
      showSpecialSearchInput.value = !showSpecialSearchInput.value;
      if (showSpecialSearchInput.value) {
        nextTick(() => {
          const input = document.getElementById('search-box-listen-special');
          if (input) {
            const searchInput = input.querySelector('input');
            if (searchInput) {
              searchInput.focus();
            }
          }
        });
      }
    };
    
    // 处理特殊页面搜索按钮点击
    const handleSpecialSearchClick = () => {
      if (showSpecialSearchInput.value) {
        // 如果搜索框已显示，执行搜索并隐藏搜索框
        search();
        showSpecialSearchInput.value = false;
      } else {
        // 如果搜索框未显示，显示搜索框
        toggleSpecialSearchInput();
      }
    };
    
    // 处理特殊页面搜索框失去焦点
    const handleSpecialSearchBlur = () => {
      showSpecialSearchInput.value = false;
    };
    
    // 返回上一页
    const goBack = () => {
      router.go(-1);
    };
    const ifShowBottomActionMenu = ref(false);
    const openBottomActionMenu = () => {
      ifShowBottomActionMenu.value = true;
    };
    // 用户信息
    const { userId, userName } = useUser();
    
    // 消息和加载状态（从父组件注入，确保全局状态一致）
    const message = inject('message', null);
    const alertMsg = message ? message.alertMsg : ref({ state: false, color: null, title: null, content: null });
    const loadMsg = message ? message.loadMsg : ref({ state: false, text: '加载中...', progress: -1 });
    const loadState = message ? message.loadState : ref(false);
    const alert = message ? message.alert : (() => {});
    const setLoading = message ? message.setLoading : (() => {});
    const setLoadState = message ? message.setLoadState : (() => {});
    
    // 关闭消息
    const closeMessage = () => {
      alertMsg.value.state = false;
    };
    
    // 从父组件注入对话框方法
    const dialog = inject('dialog', {
      setPostEditorState: () => {},
      setCourseEditorState: () => {},
      closeDialog: () => {},
    });
    const { setPostEditorState, setCourseEditorState, closeDialog } = dialog;
    
    // 移动端导航
    const {
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
      ifCanSearchInputSuggestion,
    } = useMobileNav(page, deviceType, loadState);
    
    // 搜索功能
    const {
      searchContent,
      searchType,
      searchLabel,
      searchInputEventBus,
      handleSearchTypeChanged,
      search,
    } = useSearch(ifMobile, mobileIfShowSearchInput, alert);
    
    // 导航方法
    const toHomePage = () => {
      openPage("router", {
        name: 'IndexPage',
      });
    };
    
    const toServicePage = () => {
      openPage("url", { url: "#/service" });
    };
    
    const toRagChatPage = () => {
      openPage("url", { url: "#/rag_chat" });
    };
    
    // 其他方法
    const openUrl = (url) => {
      openPage("url", { url: url });
    };
    
    // 底部导航选中状态
    const isIndexActive = computed(() => page.value === 'IndexPage');
    const isServiceActive = computed(() => page.value === 'ServicePage');
    const isSelfActive = computed(() => page.value === 'SelfPage');
    
    // 选中状态的背景色（主题色透明版本）
    const activeBgColor = computed(() => hexToRgba(themeColor, 0.1));
    
    // 创作选择底部弹出状态
    const showCreateSheet = ref(false);
    
    // 打开创作选择底部弹出
    const openCreateSheet = () => {
      showCreateSheet.value = true;
    };
    
    // 处理创作方式选择
    const handleCreate = (type) => {
      showCreateSheet.value = false;
      switch (type) {
        case 'article':
          openPage("url", { url: "#/editor" });
          break;
        case 'course':
          setCourseEditorState(true);
          break;
        case 'post':
          setPostEditorState(true);
          break;
        default:
      }
    };
    
    // 显示启动画面的函数
    const displaySplash = () => {
      showSplash.value = true;
      
      // 等待 IndexPage 加载完成后隐藏启动画面
      // 由于 IndexPage 是异步加载的，延迟隐藏以确保页面已渲染
      setTimeout(() => {
        showSplash.value = false;
      }, 1500); // 至少显示 1.5 秒，确保用户能看到启动画面
    };
    
    // 监听路由变化，控制启动画面显示
    watch(() => route.name, (newName, oldName) => {
      // 如果是直接访问 IndexPage（从 welcome 页面、直接访问或刷新页面），显示启动画面
      if (newName === 'IndexPage' && (!oldName || oldName === 'WelcomePage' || oldName === null)) {
        displaySplash();
      }
    }, { immediate: false });
    
    // 消息通知轮询
    let notificationPollingController = null;
    const initNotificationPolling = () => {
      // 只有登录用户才启动消息轮询
      if (getCookie('userName')) {
        notificationPollingController = useNotificationPolling(alert, {
          interval: 60000, // 1 分钟
        });
        notificationPollingController.startPolling();
      }
    };

    // 页面加载时检查是否需要显示启动画面
    onMounted(() => {
      if (route.name === 'IndexPage' && (!route.matched.length || route.matched[0].name === 'IndexPage')) {
        displaySplash();
      }
      // 初始化消息轮询
      initNotificationPolling();
    });

    // 组件卸载时停止轮询
    onBeforeUnmount(() => {
      if (notificationPollingController) {
        notificationPollingController.stopPolling();
      }
    });
    
    return {
      // 路由
      page,
      ifAvatarState,
      // 特殊页面
      isSpecialPage,
      showSpecialSearchInput,
      toggleSpecialSearchInput,
      handleSpecialSearchClick,
      handleSpecialSearchBlur,
      goBack,
      ifShowBottomActionMenu,
      openBottomActionMenu,
      // 更多菜单
      // 用户
      userId,
      userName,
      // 消息
      alertMsg,
      loadMsg,
      loadState,
      alert,
      setLoading,
      setLoadState,
      closeMessage,
      // 导航
      themeColor,
      ifShowNav,
      navColor,
      navIconColor,
      routerMarginTop,
      routerMarginBottom,
      ifShowHomeBtn,
      ifShowAvatar,
      ifCanSearchInputSuggestion,
      // 对话框方法
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
      // 移动端导航
      mobileIfShowSearchInput,
      ifShowBottomNav,
      // 搜索
      searchContent,
      searchType,
      searchLabel,
      searchInputEventBus,
      handleSearchTypeChanged,
      search,
      // 方法
      toHomePage,
      toServicePage,
      toRagChatPage,
      showDialog: () => {},
      openUrl,
      hexToRgba,
      // 底部导航选中状态
      isIndexActive,
      isServiceActive,
      isSelfActive,
      activeBgColor,
      // 创作选择底部弹出
      showCreateSheet,
      openCreateSheet,
      handleCreate,
      // 启动画面
      showSplash,
    };
  },
  components: {
    LoadingView,
    SplashScreen,
    GlobalMessage,
    SearchInput,
    BottomActionMenu,
  },
  mounted() {
    this.setLoadState(true);
    
    // 搜索框回车事件监听
    try {
      let searchBox = document.getElementById('search-box-listen');
      if (searchBox) {
        searchBox.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.keyCode == 13) {
            event.preventDefault();
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
              searchBtn.click();
            }
          }
        });
      }
      
      // 特殊页面搜索框事件监听（延迟执行，确保 DOM 已渲染）
      this.$nextTick(() => {
        let specialSearchBox = document.getElementById('search-box-listen-special');
        if (specialSearchBox) {
          const input = specialSearchBox.querySelector('input');
          if (input) {
            // 监听回车键事件
            input.addEventListener('keydown', (event) => {
              if (event.key === 'Enter' || event.keyCode == 13) {
                event.preventDefault();
                // 执行搜索并隐藏搜索框
                this.search();
                this.showSpecialSearchInput = false;
              }
            });
            // 监听失去焦点事件
            input.addEventListener('blur', () => {
              // 延迟隐藏，以便点击其他按钮时不会立即隐藏
              setTimeout(() => {
                if (this.showSpecialSearchInput) {
                  this.showSpecialSearchInput = false;
                }
              }, 200);
            });
          }
        }
      });
    } catch (e) {
      // 忽略错误
    }
    
    // 监听搜索输入事件总线
    this.searchInputEventBus.on("fill-search-input", (value) => {
      this.searchContent = value;
    });
  }
};
</script>
<style scoped>
.icon-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
}

/** mobile */
.nav-bar {
  z-index: 99;
  position: fixed;
  width: 100vw;
  height: fit-content;
  display: flex;
  flex-direction: row;
  padding: 5px;
  max-height: 45px;
  background-color: var(--theme-color);
}

.transparent-btn {
  background-color: transparent;
}

.router-view {
  width: 100vw;
  max-width: 100vw;
  background-color: white;
}

.absolute-position {
  position: fixed;
}

.bottom-nav-container {
  width: 100vw;
  align-items: center;
  display: flex;
  flex-direction: row;
  position: fixed;
  bottom: 0;
  background-color: white;
  height: 50px;
  border-top: #dddddd 1px solid;
  z-index: 99;
}

.bottom-nav-btn {
  transition: all 0.2s ease;
  opacity: 0.6;
}

.bottom-nav-btn:hover {
  opacity: 0.8;
}

.bottom-nav-btn--active {
  opacity: 1 !important;
  border-radius: 12px;
  transform: scale(1.05);
}

/* 创作选择底部弹出样式 */
.create-sheet {
  z-index: 100;
}

.create-sheet-content {
  border-radius: 20px 20px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.create-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.create-sheet-title {
  font-size: var(--font-size-title);
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.create-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.create-option-card {
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.create-option-card:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.create-option-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.create-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.create-option-text {
  font-size: var(--font-size-medium);
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  flex: 1;
}

/* 特殊页面导航栏样式 */
.special-nav-bar {
  justify-content: space-between;
  align-items: center;
}

.nav-btn-container {
  display: flex;
  align-items: center;
  padding: 0 4px;
}
</style>

