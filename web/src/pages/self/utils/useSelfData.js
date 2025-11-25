/**
 * SelfPage 数据管理 Composable
 */
import { ref } from 'vue';

export function useSelfData() {
  // 用户信息
  const user = ref({});
  
  // 通知列表
  const notificationList = ref([]);
  const notificationPageNum = ref(1);
  
  // 黑名单列表
  const blockList = ref([]);
  
  // 聊天列表
  const chatList = ref([]);
  
  // 加载状态
  const loading = ref({
    loadNotification: false,
    loadBlock: false,
    clearNotification: false,
  });
  
  // 其他加载状态
  const loadState = ref({
    message: false,
  });
  
  return {
    user,
    notificationList,
    notificationPageNum,
    blockList,
    chatList,
    loading,
    loadState,
  };
}

