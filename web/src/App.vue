<!-- src/App.vue -->
<template>
  <v-dialog v-if="ifShowDialog" v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <history-card v-if="ifShowHistory" @close="closeDialog"></history-card>
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
    <div v-if="this.ifShowNav" class="nav-bar" :style="{ 'background-color': navColor }">
      <avatar-name id="avatar-name" v-if="ifAvatarState && ifShowAvatar"
        :init-data="{ id: userId, name: ifMobile ? '' : userName }" :color="'#ffffff'"></avatar-name>
      <v-spacer></v-spacer>
      <v-select :color="navIconColor" :base-color="navIconColor" v-model="searchType" label="类型"
        style="max-width: 60px;min-width: 50px;margin-right: 5px;" density="compact" variant="outlined"
        :items="['文章', '帖子', '课程', '全部', '回复']" :item-color="themeColor">
      </v-select>
      <sensitive-text-field id="search-box-listen" :style="{ color: navIconColor }" :color="navIconColor" :base-color="navIconColor"
        v-model="searchContent" style="min-width: 200px;" density="compact" label="搜索 文章/帖子/课程/回复"
        variant="outlined">
      </sensitive-text-field>
      <div class="search-btn-container">
        <v-btn id="search-btn" @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="40"></v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn v-if="ifShowHomeBtn && !ifShowBottomNav" @click="toHomePage" icon="mdi-home" variant="text"
        :color="navIconColor" size="40"></v-btn>
      <v-btn v-if="ifShowTopEditBtns" @click="setPostEditorState(true)" icon="mdi-comment-question-outline"
        variant="text" :color="navIconColor" size="40"></v-btn>
      <v-btn v-if="ifShowTopEditBtns" @click="editArticle" icon="mdi-file-edit-outline" variant="text"
        :color="navIconColor" size="40"></v-btn>
      <v-btn v-if="ifShowTopEditBtns" @click="setCourseEditorState(true)" icon="mdi-book-plus-outline" variant="text"
        :color="navIconColor" size="40"></v-btn>
      <v-btn @click="setShowHistoryState(true)" icon="mdi-history" variant="text" :color="navIconColor"
        size="40"></v-btn>
    </div>
    <div
      :style="{ 'width': '100vw', 'max-width': '100vw', 'margin-top': routerMarginTop, background: '#ffffff', 'margin-bottom': routerMarginBottom }">
      <router-view id="router-view" :key="$route.fullPath" class="router-view" @alert="alert" @set_loading="setLoading"
        @search_type_changed="handleSearchTypeChanged" />
    </div>
    <div v-if="ifShowBottomNav" class="bottom-nav-container">
      <v-spacer />
      <v-btn @click="openUrl('#/index')" icon="mdi-home" variant="text" :color="themeColor" size="40"></v-btn>
      <v-spacer />
      <v-speed-dial>
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" size="40" variant="text" :color="themeColor" icon="mdi-plus"></v-btn>
        </template>
        <v-btn @click="openUrl('#/editor')" key="article" :color="themeColor" icon="mdi-file-edit-outline"></v-btn>
        <v-btn @click="setCourseEditorState(true)" key="course" :color="themeColor"
          icon="mdi-book-plus-outline"></v-btn>
        <v-btn @click="setPostEditorState(true)" key="post" :color="themeColor"
          icon="mdi-comment-question-outline"></v-btn>
      </v-speed-dial>
      <v-spacer />
      <v-btn @click="openUrl('#/self')" icon="mdi-account" variant="text" :color="themeColor" size="40"></v-btn>
      <v-spacer />
    </div>
  </v-app>
</template>
<script>
import { computed, getCurrentInstance, ref, watch } from 'vue';
import LoadingView from './components/LoadingView.vue';
import { useRoute } from 'vue-router';
import { globalProperties } from './main';
import AvatarName from './components/AvatarName.vue';
import { getCookie } from './utils/cookie';
import { getNormalInfoAlert, openNewPage } from './utils/other';
import HistoryCard from './components/HistoryCard.vue';
import SensitiveTextField from './components/SensitiveTextField.vue';
import PostEditor from './components/PostEditor.vue';
import CourseEditor from './components/CourseEditor.vue';
import { extractWords } from './utils/keyword';
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
      if (loadState.value && ['WelcomePage', 'LoginPage', 'ChatPage', undefined, null].includes(page.value)) {
        return false;
      } else {
        return true;
      }
    })
    const navColor = computed(() => {
      if (page.value == "SelfPage" || page.value=='ManagePage') {
        return '#ffffff';
      } else {
        return themeColor;
      }
    })
    const routerMarginTop = computed(() => {
      if (ifShowNav.value) {
        return '55px';
      } else {
        return '0px';
      }
    })
    const navIconColor = computed(() => {
      if (page.value == "SelfPage" || page.value=='ManagePage') {
        return themeColor;
      } else {
        return "#ffffff";
      }
    });
    const ifShowHomeBtn = computed(() => {
      return page.value == "ArticlePage" || page.value == "PostPage" || page.value == "CoursePage" || page.value == "SelfPage" || page.value == "ManagePage" || page.value == "EditorPage" || page.value == "SearchPage" || page.value == "ErrorPage" || page.value == "AuthorPage" || page.value == "SearchPage";
    })
    const ifShowAvatar = computed(() => {
      if (page.value == "SelfPage" || page.value=='ManagePage') {
        return false;
      } else {
        return true;
      }
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
    }
  },
  components: {
    LoadingView,
    AvatarName,
    HistoryCard,
    SensitiveTextField,
    PostEditor,
    CourseEditor,
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
    search() {
      let keyworkds = extractWords(this.searchContent);
      if (this.searchContent.length == 0) {
        this.alert(getNormalInfoAlert("内容不可为空"));
        return;
      }
      if (keyworkds.length == 0) {
        this.alert(getNormalInfoAlert("关键词无效，换一个试试吧 >_<"));
        return;
      }
      if (this.searchContent.length >= 25) {
        this.alert(getNormalInfoAlert("搜索内容不得超过25字"));
        return;
      }
      let s = "";
      for (let i = 0; i < keyworkds.length; i++) {
        s += keyworkds[i];
        if (i != keyworkds.length - 1) {
          s += ',';
        }
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
      this.$router.push({
        path: '/search',
        query: {
          type: type,
          query: s
        }
      });
    },
    toHomePage() {
      this.$router.push({
        name: 'IndexPage',
      })
    },
    closeDialog() {
      this.setShowHistoryState(false);
      this.setPostEditorState(false);
      this.setCourseEditorState(false);
    },
    editArticle() {
      this.$router.push({
        name: 'EditorPage',
      })
    },
    openUrl(url) {
      openNewPage(url);
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
    max-height: 55px;
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
    max-height: 55px;
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
