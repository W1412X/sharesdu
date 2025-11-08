/**
 * 路由状态管理 Composable
 */
import { ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

export function useRouteState() {
  const route = useRoute();
  const page = ref('');
  const ifAvatarState = ref(true);
  
  // 监听路由变化
  watch(route, (newRoute) => {
    page.value = newRoute.name;
    // 适配 debug 页面
    if (page.value && page.value.endsWith("Debug")) {
      page.value = page.value.substring(0, page.value.indexOf("Debug"));
    }
    // 重置头像状态以触发重新渲染
    ifAvatarState.value = false;
    nextTick(() => {
      ifAvatarState.value = true;
    });
  }, { immediate: true });
  
  return {
    page,
    ifAvatarState,
  };
}

