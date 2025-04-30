<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <div v-if="ifShowBlockList" @close="closeDialog" class="block-list-container">
        <div class="row-reverse">
          <v-btn size="20" color="#8a8a8a" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
        </div>
        <div v-for="(item, index) in this.blockList" :key="index" class="block-item">
          <avatar-name v-if="item.id" :init-data="item" />
          <v-spacer />
          <v-btn @click="cancelBlock(index)" variant="text">取消拉黑</v-btn>
        </div>
      </div>
      <color-selector-card v-if="ifShowColorSelectorCard" @set_color="setColor()"></color-selector-card>
    </div>
  </v-dialog>
  <div class="full-center">
    <v-navigation-drawer v-if="deviceType === 'desktop'" v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.profileUrl" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn v-if="!rail" size="30" class="menu-btn" :icon="'mdi-chevron-left'" @click.stop="rail = !rail"></v-btn>
      <v-list density="compact" nav :color="themeColor" v-model="choose">
        <v-list-item @click="choose = 'info'" prepend-icon="mdi-account" title="资料" value="info"></v-list-item>
        <v-list-item @click="choose = 'write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose = 'star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <!--
        <v-list-item @click="choose = 'follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        -->
        <v-list-item @click="choose = 'notification'" prepend-icon="mdi-bell" title="通知"
          value="notification"></v-list-item>
        <v-list-item @click="choose = 'chat'" prepend-icon="mdi-chat" title="私信" value="chat"></v-list-item>
        <v-list-item @click="choose = 'account'" prepend-icon="mdi-account-edit" title="账户"
          value="account"></v-list-item>
        <v-list-item @click="choose = 'setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer v-if="deviceType === 'mobile' && navVisible" v-model="drawer" :rail='false' permanent
      @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.profileUrl" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn size="30" class="menu-btn" :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
        @click="navVisible = !navVisible"></v-btn>
      <v-list density="compact" nav :color="themeColor" v-model="choose">
        <v-list-item @click="choose = 'info'" prepend-icon="mdi-account" title="资料" value="info"></v-list-item>
        <v-list-item @click="choose = 'write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose = 'star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <!--
        <v-list-item @click="choose = 'follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        -->
        <v-list-item @click="choose = 'notification'" prepend-icon="mdi-bell" title="通知"
          value="notification"></v-list-item>
        <v-list-item @click="choose = 'chat'" prepend-icon="mdi-chat" title="私信" value="chat"></v-list-item>
        <v-list-item @click="choose = 'account'" prepend-icon="mdi-account" title="账户" value="account"></v-list-item>
        <v-list-item @click="choose = 'setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-btn size="30" class="mobile-menu-btn" :icon="'mdi-chevron-right'" @click="navVisible = true"></v-btn>
    <div class="view-container">
      <!-- write part -->
      <div v-if="choose === 'write'">
        <create-preview-and-list :type="'all'" @alert="alert" @set_loading="setLoading"
          :user-id="this.user.id"></create-preview-and-list>
      </div>
      <!-- init part -->
      <div v-if="choose === 'info'">
        <author-card v-if="this.user.id != null" :type="'self'" :id="this.user.id" @alert="alert"
          @set_loading="setLoading"></author-card>
      </div>
      <!-- star part -->
      <div v-if="choose === 'star'">
        <star-card @alert="alert" @set_loading="setLoading" :type="'show'"></star-card>
      </div>
      <!-- follow part
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
        -->
      <!-- message part  -->
      <div v-if="choose === 'chat'">
        <part-loading-view :state="!loadState.message" :text="'正在加载聊天列表...'"></part-loading-view>
        <div v-if="loadState.message">
          <chat-item v-for="(item, index) in this.chatList" :init-data="item" :key="index" style="margin: 5px;"
            @alert="alert"></chat-item>
        </div>
      </div>
      <div v-if="choose === 'notification'">
        <div style="width: 100%;display: flex;flex-direction: row;">
          <v-spacer></v-spacer>
          <v-btn :loading="loading.clearNotification" :disabled="loading.clearNotification" @click="clearNotification"
            prepend-icon="mdi-delete" color="grey" class="text-small" variant="text" text="清空此页通知"></v-btn>
        </div>
        <notification-item v-for="(item, index) in this.notificationList" :key="index" :init-data="item" @alert="alert"
          @set_loading="setLoading"></notification-item>
        <v-btn :loading="loading.loadNotification" :disabled="loading.loadNotification" @click="getNotificationList"
          variant="tonal" rounded width="100%">
          加载更多
        </v-btn>
      </div>
      <!-- account part  -->
      <div v-if="choose === 'account'">
        <user-message-editor-card @set_loading="setLoading" @alert="alert"></user-message-editor-card>
      </div>
      <!-- setting part -->
      <div v-if="choose === 'setting'">
        <div class="column-list">
          <v-btn @click="toUrl('/#/document/to_know')" prepend-icon="mdi-bulletin-board" color="grey" variant="outlined"
            text="入站须知"></v-btn>
          <v-btn @click="toUrl('/#/document/privacy')" prepend-icon="mdi-lock-outline" color="grey" variant="outlined"
            text="隐私政策"></v-btn>
          <v-btn @click="toUrl('/#/document/about_us')" prepend-icon="mdi-information-variant" color="grey"
            variant="outlined" text="关于我们"></v-btn>
          <v-btn :loading="loading.loadBlock" :disabled="loading.loadBlock" @click="getBlockList"
            prepend-icon="mdi-account-cancel" color="grey" variant="outlined" text="黑名单"></v-btn>
          <v-btn @click="toUrl('/#/welcome')" prepend-icon="mdi-application-outline" color="grey" variant="outlined"
            text="下载APP"></v-btn>
          <v-btn @click="setColorSelectorCardState(true)" prepend-icon="mdi-account-box" color="grey" variant="outlined"
            text="个性化主题"></v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getBlockList, unblockUser } from '@/axios/block';
import { getChatUsers } from '@/axios/chat';
import { fetchNotificationsList, markAsReadNotification } from '@/axios/notification';
import { getNetworkErrorResponse } from '@/axios/statusCodeMessages';
import AuthorCard from '@/components/user/AuthorCard.vue';
import AvatarName from '@/components/common/AvatarName.vue';
import ChatItem from '@/components/chat/ChatItem.vue';
import ColorSelectorCard from '@/components/common/ColorSelectorCard.vue';
import CreatePreviewAndList from '@/components/user/CreatePreviewAndList.vue';
import NotificationItem from '@/components/user/NotificationItem.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import StarCard from '@/components/star/StarCard.vue';
import UserMessageEditorCard from '@/components/user/UserMessageEditorCard.vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, openNewPage } from '@/utils/other';
import { ref, computed } from 'vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
export default {
  name: 'SelfPage',
  setup() {
    var drawer = ref(true);
    var choose = ref('info');
    const rail = ref(true);
    const deviceType = globalProperties.$deviceType;
    const themeColor = globalProperties.$themeColor;
    const navVisible = ref(false);
    const selfItemType = ref('article');
    var ifShowBlockList = ref(false);
    var ifShowColorSelectorCard = ref(false);
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
  watch: {
    choose: {
      // eslint-disable-next-line
      async handler(newVal, oldVal) {
        switch (newVal) {
          case 'notification':
            if (this.notificationPageNum == 1)
              await this.getNotificationList();
            break;
          case "chat":
            if (this.chatList.length == 0)
              await this.getChatList();
            break;
          default:
            return;
        }
      },
      immediate: true
    }
  },
  beforeRouteLeave(to, from, next) {
    try{
      if (!getCookie("userName")) {
        next();
        return;
      }
      let scanMsg = {};
      scanMsg.scrollTop = document.scrollingElement.scrollTop;
      scanMsg.choose = this.choose;
      let key = 'selfScanMsg';
      selfDefinedSessionStorage.setItem(key, JSON.stringify(scanMsg));
      next()
    }catch(e){
      next();
    }
  },
  components: {
    AvatarName,
    UserMessageEditorCard,
    StarCard,
    ColorSelectorCard,
    NotificationItem,
    AuthorCard,
    CreatePreviewAndList,
    ChatItem,
    PartLoadingView,
  },
  data() {
    return {
      user: {},
      notificationList: [],
      notificationPageNum: 1,
      blockList: [],
      loading: {
        loadNotification: false,
        loadBlock: false,
        clearNotification: false,
      },
      chatList: [],
      loadState: {
        message: false,
      }
    }
  },
  methods: {

    test() {
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
    async getBlockList() {
      this.loading.loadBlock = true;
      let response = await getBlockList();
      this.loading.loadBlock = false;
      if (response.status == 200) {
        for (let i = 0; i < response.block_list.length; i++) {
          this.blockList.push({
            id: response.block_list[i].to_user_id,
            name: response.block_list[i].to_user_name,
          })
        }
        this.alert(getNormalSuccessAlert("加载成功"));
        this.setBlockListState(true);
      } else {
        this.alert(getNormalErrorAlert(response.message));
      }
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
    setColor() {
      this.setColorSelectorCardState(false);
      window.location.reload();
    },
    async getChatList() {
      this.loadState.message = false;
      let response = await getChatUsers();
      this.loadState.message = true;
      if (response.status == 200) {
        for (let i = 0; i < response.chat_users.length; i++) {
          this.chatList.push({
            id: response.chat_users[i].user_id,
            name: response.chat_users[i].username,
            msgNum: response.chat_users[i].unread_count,
            lastMsg: {
              content: response.chat_users[i].last_message.content,
              time: extractTime(response.chat_users[i].last_message.sent_at),
              isSelf: response.chat_users[i].last_message.is_sender
            }
          })
        }

      }
    },
    closeDialog() {
      this.setBlockListState(false);
    },
    toUrl(url) {
      openNewPage(url);
    },
    async clearNotification() {
      if (this.notificationList.length == 0) {
        this.alert(getNormalWarnAlert("无通知"));
        return;
      }
      let ids = [];
      for (let i = 0; i < this.notificationList.length; i++) {
        ids.push(this.notificationList[i].id);
      }
      this.loading.clearNotification = true;
      let response = await markAsReadNotification(ids);
      this.loading.clearNotification = false;
      if (response.status == 200) {
        this.notificationList = [];
      } else {
        this.alert(getNormalErrorAlert(response.message));
      }
    },
    async getNotificationList() {
      let ids = []
      this.loading.loadNotification = true;
      let response = await fetchNotificationsList(this.notificationPageNum);
      this.loading.loadNotification = false;
      if (response.status == 200) {
        for (let i = 0; i < response.notification_list.length; i++) {
          ids.push(response.notification_list[i].notification_id);
          this.notificationList.push({
            id: response.notification_list[i].notification_id,
            type: response.notification_list[i].type,
            message: response.notification_list[i].message,
            time: response.notification_list[i].created_at,
            state: response.notification_list[i].is_read,
            relatedItem: response.notification_list[i].related_object,
          })
        }
        this.notificationPageNum++;
        this.alert(getNormalSuccessAlert("获取成功"));
      } else {
        this.alert(getNormalErrorAlert(response.message));
      }
    }
  },
  async mounted() {
    this.setLoading(getCancelLoadMsg());
    this.user = {
      id: getCookie("userId"),
      name: getCookie("userName"),
      email: getCookie("userEmail"),
      passwd: "********",
      profileUrl: getCookie('userProfileUrl'),
    }
    document.getElementById('web-title').innerText = "我的";
    if (selfDefinedSessionStorage.getItem('selfScanMsg')) {
      let scanMsg = JSON.parse(selfDefinedSessionStorage.getItem('selfScanMsg'));
      setTimeout(() => {
        document.scrollingElement.scrollTop = scanMsg.scrollTop;
      }, 10);
      this.choose = scanMsg.choose;

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

@media screen and (min-width: 1000px) {
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
    margin-top: 20px;
    width: 750px;
  }

  .select-bar {
    width: 750px;
    height: 40px;
  }
}

@media screen and (max-width: 1000px) {
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
    margin-top: 20px;
    width: 100vw;
  }

  .select-bar {
    width: 100vw;
    height: 40px;
  }
}
</style>