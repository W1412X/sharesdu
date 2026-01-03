<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <BlockListDialog
        :if-show="ifShowBlockList"
        :block-list="blockList"
        @close="closeDialog"
        @cancel-block="cancelBlock"
      />
      <color-selector-card v-if="ifShowColorSelectorCard" @set_color="setColor"></color-selector-card>
    </div>
  </v-dialog>
  <div class="full-center">
    <SelfNavigationDrawer
      v-model:drawer="drawer"
      v-model:rail="rail"
      v-model:nav-visible="navVisible"
      v-model:choose="choose"
      :device-type="deviceType"
      :theme-color="themeColor"
      :user="user"
    />
    <div class="view-container">
      <!-- write part -->
      <div v-if="choose === 'write'">
        <create-preview-and-list :type="'all'" @alert="handleAlert" @set_loading="handleSetLoading"
          :user-id="user.id"></create-preview-and-list>
      </div>
      <!-- init part -->
      <div v-if="choose === 'info'">
        <author-card v-if="user.id != null" :type="'self'" :id="user.id" @alert="handleAlert"
          @set_loading="handleSetLoading"></author-card>
      </div>
      <!-- star part -->
      <div v-if="choose === 'star'">
        <star-card @alert="handleAlert" @set_loading="handleSetLoading" :type="'show'"></star-card>
      </div>
      <!-- message part  -->
      <ChatView
        v-if="choose === 'chat'"
        :chat-list="chatList"
        :load-state="loadState"
        @alert="handleAlert"
      />
      
      <!-- notification part  -->
      <NotificationView
        v-if="choose === 'notification'"
        :notification-list="notificationList"
        :loading="loading"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
        @clear-notification="clearNotification"
        @load-more="getNotificationList"
      />
      <!-- account part  -->
      <div v-if="choose === 'account'">
        <user-message-editor-card @set_loading="handleSetLoading" @alert="handleAlert"></user-message-editor-card>
      </div>
      <!-- setting part -->
      <SettingView
        v-if="choose === 'setting'"
        :loading="loading"
        @to-url="toUrl"
        @show-block-list="getBlockListAction"
        @show-color-selector="() => setColorSelectorCardState(true)"
      />
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { getCancelLoadMsg } from '@/utils/other';
import AuthorCard from '@/components/user/AuthorCard.vue';
import ColorSelectorCard from '@/components/common/ColorSelectorCard.vue';
import CreatePreviewAndList from '@/components/user/CreatePreviewAndList.vue';
import StarCard from '@/components/star/StarCard.vue';
import UserMessageEditorCard from '@/components/user/UserMessageEditorCard.vue';
import {
  SelfNavigationDrawer,
  BlockListDialog,
  NotificationView,
  ChatView,
  SettingView,
} from './components';
import {
  useSelfState,
  useSelfData,
  useSelfActions,
  useSelfRestore,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'SelfPagePc',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 使用 Composables
const {
  drawer,
  rail,
  navVisible,
  choose,
  deviceType,
  themeColor,
  ifShowBlockList,
  ifShowColorSelectorCard,
  ifShowDialog,
  setBlockListState,
  setColorSelectorCardState,
} = useSelfState();

const {
  user,
  notificationList,
  notificationPageNum,
  blockList,
  chatList,
  loading,
  loadState,
} = useSelfData();

const {
  saveState,
  restoreState,
  restoreScrollPosition,
  initUser,
} = useSelfRestore();

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

const {
  getBlockListAction,
  cancelBlock,
  setColor,
  getChatList,
  closeDialog,
  toUrl,
  clearNotification,
  getNotificationList,
} = useSelfActions(
  user,
  notificationList,
  notificationPageNum,
  blockList,
  chatList,
  loading,
  loadState,
  setBlockListState,
  setColorSelectorCardState,
  handleAlert,
  handleSetLoading
);

// 路由
const route = useRoute();

// 监听路由 query 参数，支持通过 tab 参数打开指定标签
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'notification') {
    choose.value = 'notification';
  }
}, { immediate: true });

// 监听 choose 变化，自动加载数据
watch(choose, async (newVal) => {
  switch (newVal) {
    case 'notification':
      if (notificationPageNum.value === 1) {
        await getNotificationList();
      }
      break;
    case 'chat':
      if (chatList.value.length === 0) {
        await getChatList();
      }
      break;
    default:
      return;
  }
}, { immediate: true });

// 路由离开前保存状态
onBeforeRouteLeave(() => {
  saveState({
    scrollTop: document.scrollingElement.scrollTop,
    choose: choose.value,
  });
});

// 组件挂载时初始化
onMounted(() => {
  handleSetLoading(getCancelLoadMsg());
  
  // 初始化用户信息
  user.value = initUser();
  
  // 设置页面标题
  document.getElementById('web-title').innerText = '我的';
  
  // 检查路由 query 参数
  if (route.query.tab === 'notification') {
    choose.value = 'notification';
  }
  
  // 恢复状态
  const restoredState = restoreState();
  if (restoredState) {
    restoreScrollPosition(restoredState.scrollTop);
    // 如果路由参数指定了 tab，优先使用路由参数
    if (!route.query.tab) {
      choose.value = restoredState.choose || 'info';
    }
  }
});
</script>

<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
}

.full-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

.view-container {
  margin-top: 20px;
  width: 750px;
}
</style>

