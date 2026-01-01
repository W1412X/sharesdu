<!-- src/AppDesktop.vue - PC 端版本 -->
<template>
  <v-app style="display: flex;height: 100vh;flex-direction: column;">
    <loading-view :init-data="loadMsg" class="z-index-loading absolute-position">
    </loading-view>
    <v-snackbar class="z-index-msg absolute-position" :timeout="3000" :color="alertMsg.color" v-model="alertMsg.state">
      <div v-if="alertMsg.title" class="title">{{ alertMsg.title }}</div>
      <p v-if="alertMsg.content" class="text-medium">{{ alertMsg.content }}</p>
    </v-snackbar>
    <div v-if="this.ifShowNav" class="nav-bar" :style="{ 'background-color': navColor }">
      <avatar-name id="avatar-name" v-if="ifAvatarState && ifShowAvatar"
        :init-data="{ id: userId, name: userName }" :color="'#ffffff'"></avatar-name>
      <v-spacer></v-spacer>
      <item-type-tabs 
        v-if="ifPCShowIndexTypeTab" 
        v-model="indexItemType"
        :if-mobile="false"
        :theme-color="navIconColor"
      ></item-type-tabs>
      <v-spacer v-if="ifPCShowIndexTypeTab"></v-spacer>
      <search-input id="search-box-listen" v-model="searchContent" :borderColor="navIconColor"
        :boxShadowColor="hexToRgba(navIconColor, 0.5)" :placeholderColor="navIconColor"
        :inputStyle="{ 'border-radius': '20px', height: '35px',width: ifPCShowIndexTypeTab ? '300px' : '500px', 'padding-left': '15px' }"></search-input>
      <div class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn v-if="ifShowHomeBtn" @click="toHomePage" icon="mdi-home" variant="text" size="40"
        :color="navIconColor">
        <div class="icon-container">
          <v-icon type="mdi" icon="mdi-home" :color="navIconColor" size="25"></v-icon>
        </div>
        <v-tooltip activator="parent">返回首页</v-tooltip>
      </v-btn>
      <!--
            <v-btn v-if="ifShowService" @click="toRagChatPage" icon="mdi-home" variant="text" size="38"
        :color="navIconColor">
        <div class="icon-container">
          <v-icon type="mdi" icon="mdi-head-dots-horizontal-outline" :color="navIconColor" size="25"></v-icon>
        </div>
        <v-tooltip activator="parent">问AI</v-tooltip>
      </v-btn>
      -->

      <v-btn v-if="ifShowService" @click="toServicePage" icon="mdi-home" variant="text" size="38"
        :color="navIconColor">
        <div class="icon-container">
          <v-icon type="mdi" icon="mdi-web" :color="navIconColor" size="25"></v-icon>
        </div>
        <v-tooltip activator="parent">微服务</v-tooltip>
      </v-btn>
      <v-menu v-if="ifShowTopEditBtns" open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn v-if="navIconColor == '#ffffff'" prepend-icon="mdi-plus" :color="navIconColor" variant="tonal" rounded
            v-bind="props">
            创作
          </v-btn>
          <v-btn v-else type="mdi" icon="mdi-plus" :color="navIconColor" variant="text" v-bind="props"
            size="40"></v-btn>
        </template>
        <v-list>
          <create-choice-card @close="closeDialog" @alert="alert" @set_loading="setLoading"
            @show="showDialog"></create-choice-card>
        </v-list>
      </v-menu>
    </div>
    <div
      id="router-view-container"
      :style="{ 'width': '100vw', 'max-width': '100vw', 'margin-top': routerMarginTop, background: '#ffffff', 'margin-bottom': '10px', 'flex': 1 ,'overflow-y': 'auto'}">
      <router-view id="router-view" :key="$route.fullPath" class="router-view" @alert="alert" @set_loading="setLoading"
        @search_type_changed="handleSearchTypeChanged" />
    </div>
  </v-app>
</template>
<script>
import LoadingView from '@/components/common/LoadingView.vue';
import AvatarName from '@/components/common/AvatarName';
import CreateChoiceCard from './components/common/CreateChoiceCard.vue';
import SearchInput from './components/common/searchInput/SearchInput.vue';
import { hexToRgba, openPage } from './utils/other';
import { ItemTypeTabs } from './pages/index/pc/components';
import {
  useRouteState,
  useUser,
  useNavigation,
  useSearch,
  useMessage,
  usePCAppIndexPage
} from './app/composables';
import { inject, provide, ref, watch } from 'vue';

export default {
  name: 'AppDesktop',
  setup() {
    // 设备类型
    const deviceType = { value: 'desktop' };
    const ifMobile = { value: false };
    
    // 路由状态
    const { page, ifAvatarState } = useRouteState();
    // 用户信息
    const { userId, userName } = useUser();
    
    // 消息和加载状态
    const { alertMsg, loadMsg, loadState, alert, setLoading, setLoadState } = useMessage();
    
    // 导航栏逻辑
    const {
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
    } = useNavigation(page, deviceType, loadState);
    // PC端的index页面的特殊标志
    const ifPCShowIndexTypeTab = usePCAppIndexPage(deviceType, page);
    
    // 首页 itemType 状态管理（用于导航栏的 ItemTypeTabs）
    const indexItemType = ref('article');
    
    // 监听路由变化，当离开 IndexPage 时重置 itemType
    watch(page, (newPage) => {
      if (newPage !== 'IndexPage') {
        indexItemType.value = 'article';
      }
    });
    
    // 提供 itemType 给子组件使用
    provide('indexItemType', indexItemType);
    
    // 从父组件注入对话框方法
    const dialog = inject('dialog', {
      setPostEditorState: () => {},
      setCourseEditorState: () => {},
      closeDialog: () => {},
    });
    const { setPostEditorState, setCourseEditorState, closeDialog } = dialog;
    
    // 搜索功能
    const {
      searchContent,
      searchType,
      searchLabel,
      searchInputEventBus,
      handleSearchTypeChanged,
      search,
    } = useSearch(ifMobile, { value: true }, alert);
    
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
    
    // 对话框显示方法
    const showDialog = (type) => {
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
    
    // 其他方法
    const openUrl = (url) => {
      openPage("url", { url: url });
    };
    
    return {
      // 路由
      page,
      ifAvatarState,
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
      // 导航
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
      ifPCShowIndexTypeTab,
      indexItemType,
      // 对话框方法
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
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
      showDialog,
      openUrl,
      hexToRgba,
    };
  },
  components: {
    LoadingView,
    AvatarName,
    CreateChoiceCard,
    SearchInput,
    ItemTypeTabs
  },
  methods: {
    addPost() {
      // 如果需要处理添加帖子后的逻辑，可以在这里实现
    },
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

/** desktop */
.nav-bar {
  z-index: 99;
  position: fixed;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  padding: 5px;
  max-height: 45px;
  background-color: var(--theme-color);
}

.router-view {
  width: 100vw;
  max-width: 100vw;
  background-color: white;
}
</style>

