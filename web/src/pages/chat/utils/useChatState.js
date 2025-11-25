/**
 * ChatPage 状态管理 Composable
 */
import { ref } from 'vue';
import { getCookie } from '@/utils/cookie';
import { globalProperties } from '@/main';

export function useChatState() {
  const selfId = getCookie('userId');
  const selfName = getCookie('userName');
  const themeColor = globalProperties.$themeColor;
  const deviceType = globalProperties.$deviceType;
  
  const navVisible = ref(false);
  const drawer = ref(true);
  const rail = ref(false);
  const receiverId = ref(null);
  const receiverName = ref('null');
  const ifMounted = ref(false);
  const choose = ref(null);
  
  const loading = ref({
    send: false,
    loadFrontier: false,
  });
  
  const setNavVisible = (value) => {
    navVisible.value = value;
  };
  
  const setDrawer = (value) => {
    drawer.value = value;
  };
  
  const setRail = (value) => {
    rail.value = value;
  };
  
  const setReceiverId = (value) => {
    receiverId.value = value;
  };
  
  const setReceiverName = (value) => {
    receiverName.value = value;
  };
  
  const setIfMounted = (value) => {
    ifMounted.value = value;
  };
  
  const setChoose = (value) => {
    choose.value = value;
  };
  
  const setLoading = (key, value) => {
    if (typeof key === 'string') {
      loading.value[key] = value;
    } else {
      loading.value = key;
    }
  };
  
  return {
    selfId,
    selfName,
    themeColor,
    deviceType,
    navVisible,
    drawer,
    rail,
    receiverId,
    receiverName,
    ifMounted,
    choose,
    loading,
    setNavVisible,
    setDrawer,
    setRail,
    setReceiverId,
    setReceiverName,
    setIfMounted,
    setChoose,
    setLoading,
  };
}

