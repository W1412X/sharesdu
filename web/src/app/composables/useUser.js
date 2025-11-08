/**
 * 用户信息管理 Composable
 */
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getCookie } from '@/utils/cookie';

export function useUser() {
  const route = useRoute();
  const userId = ref(getCookie("userId"));
  const userName = ref(getCookie("userName"));
  
  // 监听路由变化，更新用户信息
  watch(route, () => {
    userId.value = getCookie("userId");
    userName.value = getCookie("userName");
  });
  
  return {
    userId,
    userName,
  };
}

