/**
 * SectionPage 状态管理 Composable
 */
import { ref } from 'vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';

export function useSectionState() {
  // 用户信息
  const userId = getCookie('userId');
  const userName = getCookie('userName');
  const ifMaster = getCookie('ifMaster');
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // UI 状态
  const ifShowPostEditor = ref(false);
  const loadState = ref(false);
  
  /**
   * 设置帖子编辑器状态
   * @param {Boolean} state - 是否显示
   */
  const setPostEditorState = (state) => {
    ifShowPostEditor.value = state;
  };
  
  return {
    userId,
    userName,
    ifMaster,
    themeColor,
    ifShowPostEditor,
    loadState,
    setPostEditorState,
  };
}

