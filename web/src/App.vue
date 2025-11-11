<!-- src/App.vue -->
<template>
  <v-dialog v-if="ifShowDialog" v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <post-editor v-if="ifShowPostEditor" @close="closeDialog" @alert="alert" @set_loading="setLoading"
        @add_post="addPost"></post-editor>
      <course-editor v-if="ifShowCourseEditor" @close="closeDialog" @alert="alert"
        @set_loading="setLoading"></course-editor>
    </div>
  </v-dialog>
  <v-app style="display: flex;">
    <loading-view :init-data="loadMsg" class="z-index-loading absolute-position">
    </loading-view>
    <v-snackbar class="z-index-msg absolute-position" :timeout="3000" :color="alertMsg.color" v-model="alertMsg.state">
      <div v-if="alertMsg.title" class="title">{{ alertMsg.title }}</div>
      <p v-if="alertMsg.content" class="text-medium">{{ alertMsg.content }}</p>
    </v-snackbar>
    <div v-if="this.ifShowNav && !this.ifMobile" class="nav-bar" :style="{ 'background-color': navColor }">
      <avatar-name id="avatar-name" v-if="ifAvatarState && ifShowAvatar"
        :init-data="{ id: userId, name: ifMobile ? '' : userName }" :color="'#ffffff'"></avatar-name>
      <v-spacer></v-spacer>
      <search-input id="search-box-listen" v-model="searchContent" :borderColor="navIconColor"
        :boxShadowColor="hexToRgba(navIconColor, 0.5)" :placeholderColor="navIconColor"
        :inputStyle="{ 'border-radius': '20px', height: '35px', width: ifMobile ? '60vw' : '500px', 'padding-left': '15px' }"></search-input>
      <div class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn v-if="ifShowHomeBtn && !ifShowBottomNav" @click="toHomePage" icon="mdi-home" variant="text" size="40"
        :color="navIconColor">
        <div class="icon-container">
          <v-icon type="mdi" icon="mdi-home" :color="navIconColor" size="25"></v-icon>
        </div>
        <v-tooltip activator="parent">返回首页</v-tooltip>
      </v-btn>
      <v-btn v-if="ifShowService&&!ifMobile" @click="toServicePage" icon="mdi-home" variant="text" size="38"
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
    <div v-if="this.ifShowNav && this.ifMobile" class="nav-bar" :style="{ 'background-color': navColor }">
      <avatar-name v-if="ifAvatarState && ifShowAvatar" id="avatar-name"
        :init-data="{ id: userId, name: ifMobile ? '' : userName }" :color="'#ffffff'"></avatar-name>
      <v-spacer></v-spacer>
      <search-input v-show="mobileIfShowSearchInput" id="search-box-listen" v-model="searchContent"
        :borderColor="navIconColor" :can-suggestion="ifCanSearchInputSuggestion"
        :boxShadowColor="hexToRgba(navIconColor, 0.5)" :placeholderColor="navIconColor"
        :inputStyle="{ 'font-color': navIconColor, 'border-radius': '20px', height: '35px', width: ifMobile ? '60vw' : '500px', 'padding-left': '15px' }"></search-input>
      <div v-show="mobileIfShowSearchInput" class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="35">
          <div class="icon-container">
            <v-icon type="mdi" icon="mdi-magnify" :color="navIconColor" size="25"></v-icon>
          </div>
        </v-btn>
      </div>
      <v-tabs v-if="!mobileIfShowSearchInput" v-model="itemType" fixed-tabs class="select-bar" hide-slider>
        <v-tab height="40px" value="index" text="推荐" :class="['title-bold', 'nav-tab', { 'nav-tab--active': itemType === 'index' }]"></v-tab>
        <v-tab height="40px" value="service" text="微服务" :class="['title-bold', 'nav-tab', { 'nav-tab--active': itemType === 'service' }]"></v-tab>
      </v-tabs>
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
      :style="{ 'width': '100vw', 'max-width': '100vw', 'margin-top': routerMarginTop, background: '#ffffff', 'margin-bottom': routerMarginBottom }">
      <router-view id="router-view" :key="$route.fullPath" class="router-view" @alert="alert" @set_loading="setLoading"
        @search_type_changed="handleSearchTypeChanged" />
    </div>
    <div v-if="ifShowBottomNav" class="bottom-nav-container">
      <v-spacer />
      <v-btn @click="openUrl('#/index')" variant="text" icon="mdi-home" :color="themeColor" size="40"></v-btn>
      <v-spacer />
      <v-speed-dial>
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" size="40" variant="text" :color="themeColor" icon="mdi-plus"></v-btn>
        </template>
        <v-btn @click="openUrl('#/editor')" key="article" :color="themeColor" text="发表文章"
          prepend-icon="mdi-file-edit-outline"></v-btn>
        <v-btn @click="setCourseEditorState(true)" key="course" text="创建课程" :color="themeColor"
          prepend-icon="mdi-book-plus-outline"></v-btn>
        <v-btn @click="setPostEditorState(true)" key="post" text="发表帖子" :color="themeColor"
          prepend-icon="mdi-comment-question-outline"></v-btn>
      </v-speed-dial>
      <v-spacer />
      <v-btn @click="openUrl('#/self')" icon="mdi-account" variant="text" :color="themeColor" size="40"></v-btn>
      <v-spacer />
    </div>
  </v-app>
</template>
<script>
import LoadingView from '@/components/common/LoadingView.vue';
import AvatarName from '@/components/common/AvatarName.vue';
import PostEditor from '@/components/post/PostEditor.vue';
import CourseEditor from '@/components/course/CourseEditor.vue';
import CreateChoiceCard from './components/common/CreateChoiceCard.vue';
import SearchInput from './components/common/searchInput/SearchInput.vue';
import { hexToRgba, openPage } from './utils/other';
import {
  useDevice,
  useRouteState,
  useUser,
  useNavigation,
  useDialog,
  useSearch,
  useMessage,
  useMobileNav,
} from './app/composables';
import { watch } from 'vue';

export default {
  setup() {
    // 设备类型
    const { deviceType, ifMobile } = useDevice();
    
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
    
    // 对话框管理
    const {
      ifShowDialog,
      ifShowPostEditor,
      ifShowCourseEditor,
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
    } = useDialog();
    
    // 移动端导航
    const {
      itemType,
      itemTypeList,
      mobileIfShowSearchInput,
      ifShowBottomNav,
      routerMarginBottom,
          // eslint-disable-next-line
      watchItemType,
    } = useMobileNav(page, deviceType);
    
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
    
    // 监听 itemType 变化
    watch(itemType, (newVal, oldVal) => {
      if (newVal == oldVal) {
        return;
      }
      switch (newVal) {
        case 'service':
          toServicePage();
          break;
        case 'index':
          toHomePage();
          break;
      }
    });
    
    // 对话框显示方法
    const showDialog = (type) => {
      switch (type) {
        case 'article':
          openPage("url", "#/edit");
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
      // 设备
      deviceType,
      ifMobile,
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
      routerMarginBottom,
      ifShowHomeBtn,
      ifShowAvatar,
      ifShowTopEditBtns,
      ifShowService,
      ifCanSearchInputSuggestion,
      // 对话框
      ifShowDialog,
      ifShowPostEditor,
      ifShowCourseEditor,
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
      // 移动端导航
      itemType,
      itemTypeList,
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
      showDialog,
      openUrl,
      hexToRgba,
    };
  },
  components: {
    LoadingView,
    AvatarName,
    PostEditor,
    CreateChoiceCard,
    CourseEditor,
    SearchInput,
  },
  data() {
    return {
      // 保留 data 中的内容，因为 searchLabel 使用了 computed
    };
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
.dialog-card-container {
  display: flex;
  justify-content: center;
}

.column-scroll-div-card {
  padding: 10px;
  max-width: 550px;
  flex-direction: column;
  display: flex;
  max-height: 500px;
}

.icon-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
}
.nav-tab {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.6) !important;
  text-transform: none;
  letter-spacing: 1px;
  padding: 0 12px;
  min-height: 40px;
  transition: color 0.2s ease, background-color 0.2s ease;
  border-radius: 12px;
}
.nav-tab:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.12) !important;
}
.nav-tab--active {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/** desktop */
@media screen and (min-width: 1000px) {
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
    overflow-y: auto;
    background-color: white;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
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
    overflow-y: auto;
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
  }
}
</style>
