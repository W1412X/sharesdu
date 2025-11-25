<template>
  <div class="full-center">
    <!-- 移动端导航抽屉 -->
    <ChatNavigationDrawer
      :device-type="deviceType"
      :nav-visible="navVisible"
      :drawer="drawer"
      :theme-color="themeColor"
      :choose="choose"
      :chat-users="chatUsers"
      @update:drawer="setDrawer"
      @update:navVisible="setNavVisible"
      @update:choose="setChoose"
      @select-user="handleSelectUser">
    </ChatNavigationDrawer>
    
    <div class="total-container">
      <!-- 顶部栏 -->
      <ChatTopBar
        :device-type="deviceType"
        :self-id="selfId"
        :self-name="selfName"
        :receiver-id="receiverId"
        :receiver-name="receiverName"
        @show-nav="setNavVisible(true)"
        @to-home="handleToHomePage">
      </ChatTopBar>
      
      <!-- 移动端消息容器 -->
      <ChatMessageContainer
        v-if="deviceType === 'mobile'"
        :receiver-id="receiverId"
        :messages="messages"
        :loading="loading"
        @load-frontier="handleLoadFrontier"
        @recall="handleRecallMessage"
        @alert="handleAlert"
        @set_loading="handleSetLoading">
      </ChatMessageContainer>
      
      <!-- 桌面端布局 -->
      <div
        v-if="deviceType === 'desktop'"
        id="chat-container"
        style="display: flex; flex-direction: row; flex: 1;">
        <!-- 用户列表 -->
        <ChatUserList
          :theme-color="themeColor"
          :choose="choose"
          :chat-users="chatUsers"
          :if-mounted="ifMounted"
          @update:choose="setChoose"
          @select-user="handleSelectUser">
        </ChatUserList>
        
        <!-- 消息容器和编辑器 -->
        <div
          id="desktop-message-editor-container"
          style="flex: 1; display: flex; flex-direction: column;">
          <ChatMessageContainer
            :receiver-id="receiverId"
            :messages="messages"
            :loading="loading"
            @load-frontier="handleLoadFrontier"
            @recall="handleRecallMessage"
            @alert="handleAlert"
            @set_loading="handleSetLoading">
          </ChatMessageContainer>
          
          <ChatMessageEditor
            :receiver-id="receiverId"
            :editing-message="editingMessage"
            :loading="loading"
            :theme-color="themeColor"
            @update:editingMessage="setEditingMessage"
            @send="handleSend">
          </ChatMessageEditor>
        </div>
      </div>
      
      <!-- 移动端消息编辑器 -->
      <ChatMessageEditor
        v-if="deviceType === 'mobile'"
        :receiver-id="receiverId"
        :editing-message="editingMessage"
        :loading="loading"
        :theme-color="themeColor"
        @update:editingMessage="setEditingMessage"
        @send="handleSend">
      </ChatMessageEditor>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { openPage } from '@/utils/other';
import { getChatHistory, markMessageAsRead } from '@/api/modules/chat';
import {
  ChatNavigationDrawer,
  ChatUserList,
  ChatMessageContainer,
  ChatMessageEditor,
  ChatTopBar,
} from './components';
import {
  useChatState,
  useChatData,
  useChatActions,
  useChatLoad,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'ChatPage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 使用 Composables
const {
  selfId,
  selfName,
  themeColor,
  deviceType,
  navVisible,
  drawer,
  receiverId,
  receiverName,
  ifMounted,
  choose,
  loading,
  setNavVisible,
  setDrawer,
  setReceiverId,
  setReceiverName,
  setIfMounted,
  setChoose,
  setLoading,
} = useChatState();

const {
  messages,
  chatUsers,
  chatHistoryDict,
  chatPageDict,
  editingMessage,
  addMessage,
  setMessages,
  removeMessage,
  addChatUser,
  setChatUsers,
  updateChatUser,
  setChatHistory,
  getChatHistory: getCachedChatHistory,
  setChatPage,
  getChatPage,
  incrementChatPage,
  setEditingMessage,
} = useChatData();

// 滚动函数
const scrollToBottom = () => {
  setTimeout(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
  }, 100);
};

const scrollToTop = () => {
  setTimeout(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo(0, 0);
    }
  }, 100);
};

// 操作处理
const {
  send,
  loadFrontier,
  handleRecall: handleRecallAction,
  selectUser,
} = useChatActions(
  receiverId,
  receiverName,
  selfId,
  selfName,
  editingMessage,
  messages,
  chatUsers,
  chatHistoryDict,
  chatPageDict,
  setMessages,
  addMessage,
  removeMessage,
  updateChatUser,
  setChatHistory,
  getCachedChatHistory,
  setChatPage,
  getChatPage,
  incrementChatPage,
  setEditingMessage,
  setLoading,
  loading,
  scrollToBottom,
  scrollToTop,
  (msg) => emit('alert', msg)
);

// 加载逻辑
const {
  loadChatHistory,
  loadChatUsers,
  initViewSize,
} = useChatLoad(
  receiverId,
  receiverName,
  selfId,
  selfName,
  ifMounted,
  messages,
  chatUsers,
  chatHistoryDict,
  chatPageDict,
  setMessages,
  setChatHistory,
  setChatPage,
  addChatUser,
  setChatUsers,
  setReceiverId,
  setReceiverName,
  setIfMounted,
  setLoading,
  scrollToBottom,
  (msg) => emit('alert', msg)
);

// 事件处理
const handleToHomePage = () => {
  openPage('router', {
    name: 'IndexPage',
  });
};

const handleSend = async () => {
  await send();
};

const handleLoadFrontier = async () => {
  await loadFrontier(getChatHistory, markMessageAsRead);
};

const handleSelectUser = (index) => {
  selectUser(index, chatUsers.value);
};

const handleRecallMessage = (id) => {
  handleRecallAction(id);
};

const handleAlert = (msg) => {
  emit('alert', msg);
};

const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 监听 receiverId 变化
watch(receiverId, async () => {
  if (!ifMounted.value) {
    return;
  }
  
  if (receiverId.value) {
    await loadChatHistory();
  }
}, { immediate: true });

// 监听 receiverName 变化
watch(receiverName, (newVal) => {
  const titleElement = document.getElementById('web-title');
  if (titleElement) {
    titleElement.innerText = '聊天 | ' + newVal;
  }
}, { immediate: true });

// 键盘事件处理
let keyboardHandler = null;

// 挂载时初始化
onMounted(async () => {
  // 添加键盘监听
  keyboardHandler = async (event) => {
    if (event.ctrlKey && (event.key === 'Enter' || event.code === 'Enter')) {
      event.preventDefault();
      await handleSend();
    }
  };
  document.addEventListener('keydown', keyboardHandler);
  
  // 初始化视图尺寸
  initViewSize();
  
  // 设置接收者
  const paramId = route.params.id;
  const paramName = route.params.name;
  
  if (paramId && paramName) {
    setReceiverId(paramId);
    setReceiverName(paramName);
  }
  
  // 加载聊天用户列表
  await loadChatUsers({ id: paramId, name: paramName });
  
  // 设置标题
  const titleElement = document.getElementById('web-title');
  if (titleElement) {
    titleElement.innerText = '聊天 | ' + receiverName.value;
  }
  
  setIfMounted(true);
});

// 卸载时清理
onUnmounted(() => {
  if (keyboardHandler) {
    document.removeEventListener('keydown', keyboardHandler);
  }
});

</script>

<style scoped>
.full-center {
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
}

.total-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media screen and (min-width: 1000px) {
  .full-center {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
  }
}

@media screen and (max-width: 1000px) {
  .full-center {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
  }
}
</style>

