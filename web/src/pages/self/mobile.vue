<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- 全局对话框 -->
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

  <!-- 内容弹窗 -->
  <v-dialog
    v-model="showContentDialog"
    fullscreen
    transition="dialog-bottom-transition"
    class="content-dialog"
  >
    <v-card class="content-dialog-card">
      <div class="dialog-header">
        <div class="dialog-title text-title-bold">{{ currentDialogTitle }}</div>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="closeContentDialog"
        >
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </div>
      <div class="dialog-content">
        <!-- write part -->
        <div v-if="currentDialogType === 'write'">
          <create-preview-and-list :type="'all'" @alert="handleAlert" @set_loading="handleSetLoading"
            :user-id="user.id"></create-preview-and-list>
        </div>
        <!-- star part -->
        <div v-if="currentDialogType === 'star'">
          <star-card @alert="handleAlert" @set_loading="handleSetLoading" :type="'show'"></star-card>
        </div>
        <!-- message part  -->
        <ChatView
          v-if="currentDialogType === 'chat'"
          :chat-list="chatList"
          :load-state="loadState"
          @alert="handleAlert"
        />
        
        <!-- notification part  -->
        <NotificationView
          v-if="currentDialogType === 'notification'"
          :notification-list="notificationList"
          :loading="loading"
          @alert="handleAlert"
          @set-loading="handleSetLoading"
          @clear-notification="clearNotification"
          @load-more="getNotificationList"
        />
        <!-- account part  -->
        <div v-if="currentDialogType === 'account'">
          <user-message-editor-card @set_loading="handleSetLoading" @alert="handleAlert"></user-message-editor-card>
        </div>
        <!-- setting part -->
        <SettingView
          v-if="currentDialogType === 'setting'"
          :loading="loading"
          @to-url="toUrl"
          @show-block-list="getBlockListAction"
          @show-color-selector="() => setColorSelectorCardState(true)"
        />
      </div>
    </v-card>
  </v-dialog>

  <!-- 主界面 -->
  <div class="mobile-container">
    <!-- 用户信息卡片 -->
    <div class="user-card-section">
      <author-card v-if="user.id != null" :type="'self'" :id="user.id" @alert="handleAlert"
        @set_loading="handleSetLoading"></author-card>
    </div>

    <!-- 功能按钮网格 -->
    <div class="function-grid">
      <v-card
        v-for="item in functionItems"
        :key="item.type"
        class="function-card"
        elevation="2"
        @click="openContentDialog(item.type, item.title)"
      >
        <div class="function-card-content">
          <v-icon :icon="item.icon" :color="themeColor" size="32"></v-icon>
          <div class="function-card-title text-small">{{ item.title }}</div>
        </div>
      </v-card>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <v-card class="menu-item" elevation="1" @click="openContentDialog('account', '编辑个人信息')">
        <div class="menu-item-content">
          <v-icon icon="mdi-account-edit" :color="themeColor" size="24"></v-icon>
          <div class="menu-item-title text-medium">编辑个人信息</div>
          <v-spacer></v-spacer>
          <v-icon icon="mdi-chevron-right" color="#8a8a8a" size="20"></v-icon>
        </div>
      </v-card>
      <v-card class="menu-item" elevation="1" @click="openContentDialog('setting', 'App设置')">
        <div class="menu-item-content">
          <v-icon icon="mdi-cog" :color="themeColor" size="24"></v-icon>
          <div class="menu-item-title text-medium">App设置</div>
          <v-spacer></v-spacer>
          <v-icon icon="mdi-chevron-right" color="#8a8a8a" size="20"></v-icon>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { getCancelLoadMsg } from '@/utils/other';
import AuthorCard from '@/components/user/AuthorCard.vue';
import ColorSelectorCard from '@/components/common/ColorSelectorCard.vue';
import CreatePreviewAndList from '@/components/user/CreatePreviewAndList.vue';
import StarCard from '@/components/star/StarCard.vue';
import UserMessageEditorCard from '@/components/user/UserMessageEditorCard.vue';
import {
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
  name: 'SelfPageMobile',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 使用 Composables
const {
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

// 内容弹窗状态
const showContentDialog = ref(false);
const currentDialogType = ref('');
const currentDialogTitle = ref('');

// 功能按钮列表
const functionItems = [
  { type: 'star', title: '收藏', icon: 'mdi-star' },
  { type: 'chat', title: '私信', icon: 'mdi-chat' },
  { type: 'notification', title: '通知', icon: 'mdi-bell' },
  { type: 'write', title: '创作', icon: 'mdi-pencil' },
];

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

// 打开内容弹窗
const openContentDialog = async (type, title) => {
  currentDialogType.value = type;
  currentDialogTitle.value = title;
  showContentDialog.value = true;

  // 根据类型加载数据
  switch (type) {
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
  }
};

// 关闭内容弹窗
const closeContentDialog = () => {
  showContentDialog.value = false;
  // 延迟清空类型，避免内容闪烁
  setTimeout(() => {
    currentDialogType.value = '';
    currentDialogTitle.value = '';
  }, 300);
};

// 路由离开前保存状态
onBeforeRouteLeave(() => {
  saveState({
    scrollTop: document.scrollingElement.scrollTop,
    choose: 'info', // 移动端固定为 info
  });
});

// 组件挂载时初始化
onMounted(() => {
  handleSetLoading(getCancelLoadMsg());
  
  // 初始化用户信息
  user.value = initUser();
  
  // 设置页面标题
  document.getElementById('web-title').innerText = '我的';
  
  // 恢复状态
  const restoredState = restoreState();
  if (restoredState) {
    restoreScrollPosition(restoredState.scrollTop);
  }
});
</script>

<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
}

.mobile-container {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 20px;
  background-color: #f5f5f5;
}

.user-card-section {
  padding: px;
  background-color: white;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.function-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.function-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  gap: 8px;
}

.function-card-title {
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
}

.menu-list {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.menu-item-title {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
}

/* 内容弹窗样式 */
.content-dialog-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.dialog-title {
  color: rgba(0, 0, 0, 0.87);
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  -webkit-overflow-scrolling: touch;
}
</style>

