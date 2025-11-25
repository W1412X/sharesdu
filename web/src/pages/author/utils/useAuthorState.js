/**
 * AuthorPage 状态管理 Composable
 */
import { ref } from 'vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';

export function useAuthorState() {
  // 用户信息
  const ifMaster = getCookie('ifMaster');
  const currentUserId = getCookie('userId');
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 内容类型（文章/帖子/回复）
  const itemType = ref('article');
  
  // 显示模式（preview/all）
  const displayMode = ref('preview');
  
  // 加载状态
  const loadState = ref(false);
  
  return {
    ifMaster,
    currentUserId,
    themeColor,
    itemType,
    displayMode,
    loadState,
  };
}

