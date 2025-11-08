/**
 * 消息和加载状态管理 Composable
 */
import { ref } from 'vue';

export function useMessage() {
  const alertMsg = ref({
    state: false,
    color: null,
    title: null,
    content: null,
  });
  
  const loadMsg = ref({
    state: false,
    text: '加载中...',
    progress: -1,
  });
  
  const loadState = ref(false);
  
  const alert = (msg) => {
    alertMsg.value = msg;
  };
  
  const setLoading = (msg) => {
    loadMsg.value = msg;
  };
  
  const setLoadState = (state) => {
    loadState.value = state;
  };
  
  return {
    alertMsg,
    loadMsg,
    loadState,
    alert,
    setLoading,
    setLoadState,
  };
}

