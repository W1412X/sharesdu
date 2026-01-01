/**
 * DeveloperPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

export function useDeveloperState() {
  const ifMobile = computed(() => globalProperties.$deviceType === 'mobile');
  const themeColor = computed(() => globalProperties.$themeColor || '#667eea');
  const currentDoc = ref('');
  const expandedKeys = ref(new Set());
  const loadState = ref(false);
  
  return {
    ifMobile,
    themeColor,
    currentDoc,
    expandedKeys,
    loadState,
  };
}

