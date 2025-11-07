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
    <!--
    <div v-if="deviceType === 'mobile'" class="nav-bar">
      <v-btn rounded="0" variant="text" color="#ffffff" icon="mdi-menu"></v-btn>
    </div>
    -->
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
        <v-tab :style="{ background: 'rgba(255,255,255,0)', 'color': this.itemType == 'index' ? 'white' : 'grey' }"
          height="40px" value="index" text="推荐"></v-tab>
        <v-tab :style="{ background: 'rgba(255,255,255,0)', 'color': this.itemType == 'service' ? 'white' : 'grey' }"
          height="40px" value="service" text="微服务"></v-tab>
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
import { computed, getCurrentInstance, ref, watch } from 'vue';
import LoadingView from '@/components/common/LoadingView.vue';
import { useRoute } from 'vue-router';
import { globalProperties } from './main';
import AvatarName from '@/components/common/AvatarName.vue';
import { getCookie } from './utils/cookie';
import { getNormalInfoAlert, hexToRgba, openPage } from './utils/other';
import PostEditor from '@/components/post/PostEditor.vue';
import CourseEditor from '@/components/course/CourseEditor.vue';
import CreateChoiceCard from './components/common/CreateChoiceCard.vue';
import SearchInput from './components/common/searchInput/SearchInput.vue';
import { createEventBus, getEventBus } from './utils/eventBus';
export default {
  setup() {
    /**
     * get the device type
     */
    const deviceType = ref('');
    if (window.innerWidth <= 1000) {
      deviceType.value = 'mobile';
    } else {
      deviceType.value = 'desktop';
    }
    //listen the route change
    const route = useRoute();
    const page = ref('');
    // eslint-disable-next-line
    const themeColor = globalProperties.$themeColor;
    const loadState = ref(false);
    const setLoadState = (state) => {
      loadState.value = state;
    }
    const ifShowNav = computed(() => {
      if (loadState.value && ['WelcomePage', 'LoginPage', 'ChatPage', 'DocumentPage', 'DevPage', undefined, null].includes(page.value)) {
        return false;
      } else {
        return true;
      }
    })
    const navColor = computed(() => {
      if (page.value == "SelfPage" || page.value == 'ManagePage') {
        return '#ffffff';
      } else {
        return themeColor;
      }
    })
    const routerMarginTop = computed(() => {
      if (ifShowNav.value) {
        return '41px';
      } else {
        return '0px';
      }
    })
    const navIconColor = computed(() => {
      if (page.value == "SelfPage" || page.value == 'ManagePage') {
        return themeColor;
      } else {
        return "#ffffff";
      }
    });
    const ifShowHomeBtn = computed(() => {
      return page.value == "ArticlePage" || page.value == "PostPage" || page.value == "CoursePage" || page.value == "SelfPage" || page.value == "ManagePage" || page.value == "EditorPage" || page.value == "SearchPage" || page.value == "ErrorPage" || page.value == "AuthorPage" || page.value == "SearchPage" || page.value=="ServicePage";
    })
    const ifShowAvatar = computed(() => {
      if (page.value == "SelfPage" || page.value == 'ManagePage') {
        return false;
      } else {
        return true;
      }
    })
    const ifCanSearchInputSuggestion = computed(() => {
      return !['SearchMobilePage'].includes(page.value);
    })
    const ifAvatarState = ref(true);
    const ifMobile = computed(() => {
      return deviceType.value == "mobile";
    })
    const userId = ref(getCookie("userId"));
    const userName = ref(getCookie("userName"));
    const { proxy } = getCurrentInstance();
    // eslint-disable-next-line
    watch(route, (newRoute, oldRoute) => {
      page.value = newRoute.name;
      //adapt for debug page
      if (page.value.endsWith("Debug")) {
        page.value = page.value.substring(0, page.value.indexOf("Debug"))
      }
      userId.value = getCookie("userId");
      userName.value = getCookie("userName");
      ifAvatarState.value = false;
      proxy.$nextTick(() => {
        ifAvatarState.value = true;
      });
    });
    const ifShowHistory = ref(false);
    const ifShowCourseEditor = ref(false);
    const ifShowPostEditor = ref(false);
    const ifShowDialog = computed(() => {
      return ifShowHistory.value || ifShowCourseEditor.value || ifShowPostEditor.value;
    })
    const setShowHistoryState = (state) => {
      ifShowHistory.value = state;
    }
    const ifShowBottomNav = computed(() => {
      return ['SelfPage', 'IndexPage', 'SearchPage'].includes(page.value) && deviceType.value == 'mobile';
    })
    const routerMarginBottom = computed(() => {
      return ifShowBottomNav.value ? '50px' : '10px';
    })
    const setPostEditorState = (state) => {
      ifShowPostEditor.value = state;
    }
    const setCourseEditorState = (state) => {
      ifShowCourseEditor.value = state;
    }
    const ifShowTopEditBtns = computed(() => {
      return deviceType.value === 'desktop' && ['IndexPage', 'SelfPage'].includes(page.value);
    })
    const mobileIfShowSearchInput = computed(() => {
      if (['IndexPage','ServicePage'].includes(page.value)) {
        return false;
      }
      return true;
    });
    const itemType = ref("index");
    const itemTypeList = ['index', 'service'];
    const ifShowService=computed(()=>{
      return ['IndexPage'].includes(page.value);
    });
    const searchInputEventBus=getEventBus("global-search-input")?getEventBus("global-search-input"):createEventBus("global-search-input");
    return {
      ifShowNav,
      navColor,
      navIconColor,
      userId,
      userName,
      routerMarginTop,
      ifShowDialog,
      ifShowHistory,
      ifAvatarState,
      setShowHistoryState,
      ifShowAvatar,
      setLoadState,
      themeColor,
      ifShowBottomNav,
      routerMarginBottom,
      setCourseEditorState,
      setPostEditorState,
      ifShowCourseEditor,
      ifShowPostEditor,
      ifShowHomeBtn,
      ifShowTopEditBtns,
      ifMobile,
      mobileIfShowSearchInput,
      itemType,
      itemTypeList,
      ifCanSearchInputSuggestion,
      ifShowService,
      searchInputEventBus,
    }
  },
  components: {
    LoadingView,
    AvatarName,
    PostEditor,
    CreateChoiceCard,
    CourseEditor,
    SearchInput,
  },
  watch:{
    itemType:{
      handler(newVal,oldVal){
        if(newVal==oldVal){
          return;
        }
        switch(newVal){
          case 'service':
            this.toServicePage();
            break;
          case 'index':
            this.toHomePage();
            break;
        }
      }
    }
  },
  data() {
    return {
      alertMsg: {
        state: false,
        color: null,
        title: null,
        content: null,
      },
      loadMsg: {
        state: false,
        text: '加载中...',
        progress: -1,
      },
      searchLabel: computed(() => {
        return "搜索" + this.searchType;
      }),
      searchContent: "",
      searchType: "全部",
    }
  },
  methods: {
    alert(msg) {
      this.alertMsg = msg;
    },
    setLoading(msg) {
      this.loadMsg = msg;
    },
    handleSearchTypeChanged(type) {
      this.searchType = type;
    },
    hexToRgba(hex, opacity) {
      return hexToRgba(hex, opacity);
    },
    showDialog(type) {
      switch (type) {
        case 'article':
          openPage("url", "#/edit");
          break;
        case 'course':
          this.setCourseEditorState(true);
          break;
        case 'post':
          this.setPostEditorState(true);
          break;
        default:
      }
    },
    search() {
      if (this.ifMobile && !this.mobileIfShowSearchInput) {
        openPage("url", { url: "#/search_mobile" });
        return;
      }
      let dealedString = this.searchContent.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
      if (dealedString.length == 0) {
        this.alert(getNormalInfoAlert("关键词无效，换一个试试吧 >_<"));
        this.searchContent = "";
        return;
      }
      if (dealedString.length >= 25) {
        this.alert(getNormalInfoAlert("搜索内容不得超过25字"));
        this.searchContent = "";
        return;
      }
      let type = null;
      switch (this.searchType) {
        case '文章':
          type = 'article';
          break;
        case '帖子':
          type = 'post';
          break;
        case '课程':
          type = 'course';
          break;
        case '全部':
          type = 'all';
          break;
        case '回复':
          type = 'reply';
          break;
        default:
          type = 'all';
      }
      openPage("router", {
        path: '/search',
        query: {
          type: type,
          query: dealedString
        }
      });
    },
    toHomePage() {
      openPage("router", {
        name: 'IndexPage',
      })
    },
    closeDialog() {
      this.setShowHistoryState(false);
      this.setPostEditorState(false);
      this.setCourseEditorState(false);
    },
    editArticle() {
      openPage("router", {
        name: 'EditorPage',
      })
    },
    openUrl(url) {
      openPage("url", { url: url });
    },
    toServicePage(){
      openPage("url",{url:"#/service"});
    }
  },
  created() {
  },
  mounted() {
    this.setLoadState(true);
    try {
      let searchBox = document.getElementById('search-box-listen');
      searchBox.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.keyCode == 13) {
          event.preventDefault();
          document.getElementById('search-btn').click();
        }
      });
    } catch (e) {
      //eslint-disable-next-line
    }
    this.searchInputEventBus.on("fill-search-input",(value)=>{
      this.searchContent=value;
    })

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
    overflow-y: scroll;
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
    overflow-y: scroll;
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
