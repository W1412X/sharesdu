<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <div v-if="ifShowBlockList" @close="closeDialog" class="block-list-container">
        <div class="row-reverse">
          <v-btn size="20" color="#8a8a8a" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
        </div>
        <div v-for="(item, index) in this.blockList" :key="index" class="block-item">
          <avatar-name :init-data="item" />
          <v-spacer />
          <v-btn @click="cancelBlock(index)" variant="text">取消拉黑</v-btn>
        </div>
      </div>
      <color-selector-card v-if="ifShowColorSelectorCard" @set_color="closeDialog()"></color-selector-card>
    </div>
  </v-dialog>
  <div class="full-center">
    <v-navigation-drawer v-if="deviceType === 'desktop'" v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.avatar" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn v-if="!rail" size="30" class="menu-btn" :icon="'mdi-chevron-left'" @click.stop="rail = !rail"></v-btn>
      <v-list density="compact" nav :color="themeColor">
        <v-list-item @click="choose = 'write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose = 'star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <v-list-item @click="choose = 'follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        <v-list-item @click="choose = 'message'" prepend-icon="mdi-email" title="信息" value="message"></v-list-item>
        <v-list-item @click="choose = 'account'" prepend-icon="mdi-account" title="账户" value="account"></v-list-item>
        <v-list-item @click="choose = 'setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer v-if="deviceType === 'mobile' && navVisible" v-model="drawer" :rail='false' permanent
      @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.avatar" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn size="30" class="menu-btn" :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
        @click="navVisible = !navVisible"></v-btn>
      <v-list density="compact" nav :color="themeColor">
        <v-list-item @click="choose = 'write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose = 'star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <v-list-item @click="choose = 'follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        <v-list-item @click="choose = 'message'" prepend-icon="mdi-email" title="信息" value="message"></v-list-item>
        <v-list-item @click="choose = 'account'" prepend-icon="mdi-account" title="账户" value="account"></v-list-item>
        <v-list-item @click="choose = 'setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-btn size="30" class="mobile-menu-btn" :icon="'mdi-chevron-right'" @click="navVisible = true"></v-btn>
    <div class="view-container">
      <!-- write part -->
      <div v-if="choose === 'write'">
        <v-tabs v-model="selfItemType" fixed-tabs class="select-bar">
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'article' ? '#000000' : '#8a8a8a' }"
            height="40px" value="article" text="文章"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'post' ? '#000000' : '#8a8a8a' }"
            height="40px" value="post" text="帖子"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'course' ? '#000000' : '#8a8a8a' }"
            height="40px" value="course" text="课程"></v-tab>
        </v-tabs>
        <div v-if="selfItemType == 'article'" class="item-container">
          <article-item v-for="(item, index) in this.selfArticleList" :key="index" :init-data="item">
          </article-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="selfItemType == 'post'" class="item-container">
          <post-item v-for="(item, index) in this.selfPostList" :key="index" :init-data="item">
          </post-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="selfItemType == 'course'" class="item-container">
          <course-item v-for="(item, index) in this.selfCourseList" :key="index" :init-data="item">
          </course-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
      </div>
      <!-- star part -->
      <div v-if="choose === 'star'">
        <star-card @alert="alert" @set_loading="setLoading" :type="'show'"></star-card>
      </div>
      <!-- follow part  -->
      <div v-if="choose === 'follow'">
        <div v-for="(item, index) in followList" :key="index" class="follow-bar">
          <avatar-name :init-data="{ name: item.name, avatar: item.avatar }"></avatar-name>
          <v-spacer></v-spacer>
          <v-btn @click="follow(item.name, index)" variant="tonal" :color="followStateList[index] ? 'grey' : themeColor"
            rounded>
            {{ followStateList[index] ? '已关注' : '关注' }}
          </v-btn>
        </div>
      </div>
      <!-- message part  -->
      <div v-if="choose === 'message'">
        <div v-for="(item, index) in this.messageList" :key="index" class="message-bar">
          <avatar-name :init-data="{ name: item.name, avatar: item.avatar }"></avatar-name>
          <div class="text-medium message-text">{{ item.message }}</div>
          <div class="text-small message-time">{{ item.time }}</div>
        </div>
      </div>
      <!-- account part  -->
      <div v-if="choose === 'account'">
        <user-message-editor-card @set_loading="setLoading" @alert="alert"></user-message-editor-card>
      </div>
      <!-- setting part -->
      <div v-if="choose === 'setting'">
        <div class="column-list">
          <v-btn to="/document/to_know" target="_blank" prepend-icon="mdi-bulletin-board" color="grey"
            variant="outlined" text="入站须知"></v-btn>
          <v-btn to="/document/privacy" target="_blank" prepend-icon="mdi-lock-outline" color="grey" variant="outlined"
            text="隐私政策"></v-btn>
          <v-btn to="/document/about_us" target="_blank" prepend-icon="mdi-information-variant" color="grey"
            variant="outlined" text="关于我们"></v-btn>
          <v-btn @click="setBlockListState(true)" prepend-icon="mdi-account-cancel" color="grey" variant="outlined"
            text="黑名单"></v-btn>
            <v-btn @click="setColorSelectorCardState(true)" prepend-icon="mdi-account-box" color="grey" variant="outlined"
            text="个性化主题"></v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getAuthorInfo } from '@/axios/account';
import { scSelfInfo } from '@/axios/api_convert/account';
import { unblockUser } from '@/axios/block';
import { getNetworkErrorResponse } from '@/axios/statusCodeMessages';
import ArticleItem from '@/components/ArticleItem.vue';
import AvatarName from '@/components/AvatarName.vue';
import ColorSelectorCard from '@/components/ColorSelectorCard.vue';
import CourseItem from '@/components/CourseItem.vue';
import PostItem from '@/components/PostItem.vue';
import StarCard from '@/components/StarCard.vue';
import UserMessageEditorCard from '@/components/UserMessageEditorCard.vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert } from '@/utils/other';
import { ref, computed } from 'vue';
export default {
  name: 'SelfPage',
  setup() {
    var drawer = ref(true);
    var choose = ref('write');
    const rail = ref(true);
    const deviceType = globalProperties.$deviceType;
    const themeColor = globalProperties.$themeColor;
    const navVisible = ref(false);
    const selfItemType = ref('article');
    var ifShowBlockList = ref(false);
    var ifShowColorSelectorCard=ref(false);
    var ifShowDialog = computed(() => {
      return ifShowBlockList.value || ifShowColorSelectorCard.value;
    });
    const setBlockListState = ((state) => {
      ifShowBlockList.value = state;
    })
    const setColorSelectorCardState = ((state) => {
      ifShowColorSelectorCard.value = state;
    })
    return {
      drawer,
      rail,
      deviceType,
      themeColor,
      selfItemType,
      choose,
      navVisible,
      ifShowBlockList,
      ifShowDialog,
      setBlockListState,
      ifShowColorSelectorCard,
      setColorSelectorCardState,
    }
  },
  components: {
    ArticleItem,
    PostItem,
    CourseItem,
    AvatarName,
    UserMessageEditorCard,
    StarCard,
    ColorSelectorCard,
  },
  data() {
    return {
      user: {},
      selfArticleList: [],
      selfPostList: [],
      selfCourseList: [],
      followList: [],
      followStateList: [],
      messageList: [],
      blockList: [],
    }
  },
  methods: {

    test() {
      console.log(this.drawer);
    },
    follow(name, index) {
      this.followStateList[index] = !this.followStateList[index];
    },
    setLoading(msg) {
      this.$emit('set_loading', msg);
    },
    alert(msg) {
      this.$emit("alert", msg);
    },
    async cancelBlock(index) {
      let user = this.blockList[index];
      /**
       * here to request
       */
      var response = getNetworkErrorResponse();
      this.setLoading(getLoadMsg("正在处理", -1));
      response = await unblockUser(user.id);
      if (response.status == 200) {
        this.blockList.splice(index, 1);
        this.alert({ state: true, color: "success", title: "取消成功", content: "已取消拉黑用户" + String(user.name) });
      } else {
        this.alert({ state: true, color: "error", title: "请求失败", content: response.message });
      }
      this.setLoading(getCancelLoadMsg());
    },
    closeDialog() {
      this.setBlockListState(false);
      this.setColorSelectorCardState(false);
    }
  },
  async mounted() {
    //if no id,to the user page
    if(!this.$route.params.id){
      this.$router.push({ name: 'SelfPage', params: { id: getCookie("userId") } })
      return;
    }
    /**
     * check if the user is self
     */
    if (this.$route.params.id != getCookie("userId")) {
      this.$router.push({ name: 'AuthorPage', params: { id: this.$route.params.id } })
      return;
    }
    /**
     * get the user message
     */
    const response = await getAuthorInfo(this.$route.params.id);
    if (response.status == 200) {
      const tmp = scSelfInfo(response.info);
      if (tmp.blockStatus) {
        //if the user is blocked  
        this.alert({
          color: "warning",
          title: "您已被封禁",
          content: "您的账户已被封禁，请联系管理员",
          state: true
        })
        this.$router.push({
          name: 'ErrorPage', params: {
            reason: "账户已被封禁至 " + String(tmp.blockEndTime)
          }
        });
        return;
      } else {
        /**
         * set the got data
         */
        this.user = tmp;
      }
    } else {
      /**
       * error
       * to error page and show the alert
       */
      this.alert(getNormalErrorAlert(response.message));
      //this.$router.push({ name: 'ErrorPage', params: { reason: "无法找到此用户" } });
    }
  }
  /**
   * 
   */
}
</script>
<style scoped>
.name {
  color: var(--theme-color);
  margin-left: 8px;
}

.dialog-card-container {
  display: flex;
  justify-content: center;
}

.load-btn {
  height: 30px;
  width: 100%;
  margin-top: 5px;
}

.menu-btn {
  position: fixed;
  bottom: 50%;
  right: -15px;
  z-index: 100;
}

.mobile-menu-btn {
  position: fixed;
  bottom: 50%;
  left: 0px;
  z-index: 100;
}
.follow-bar {
  padding: 10px;
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  border: grey 1px solid;
}

.setting-btn {
  width: 100%;
}

.block-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  border-bottom: solid 1px #8a8a8a;
}

@media screen and (min-width: 600px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .block-list-container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    max-height: 800px;
    width: 600px;
  }

  .column-list {
    width: 750px;
    display: flex;
    flex-direction: column;
  }

  .view-container {
    width: 750px;
  }

  .select-bar {
    width: 750px;
    height: 40px;
  }
}

@media screen and (max-width: 600px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .column-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .block-list-container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    max-height: 60vh;
    width: 80vw;
  }

  .view-container {
    width: 100vw;
  }

  .select-bar {
    width: 100vw;
    height: 40px;
  }
}
</style>