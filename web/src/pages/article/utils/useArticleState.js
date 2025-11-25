/**
 * ArticlePage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';

export function useArticleState() {
  // 用户信息
  const userId = getCookie('userId');
  const userName = getCookie('userName');
  const ifMaster = getCookie('ifMaster');
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // UI 状态
  const ifShowComment = ref(false);
  const ifShowPostEditor = ref(false);
  const loadState = ref(false);
  
  // 编辑器类型
  const editorType = ref('html');
  
  // 计算属性
  const ifShowDialog = computed(() => {
    return ifShowPostEditor.value;
  });
  
  /**
   * 设置帖子编辑器状态
   * @param {Boolean} state - 是否显示
   */
  const setPostEditorState = (state) => {
    ifShowPostEditor.value = state;
  };
  
  /**
   * 设置评论状态
   * @param {Boolean} state - 是否显示
   */
  const setCommentState = (state) => {
    ifShowComment.value = state;
  };
  
  return {
    userId,
    userName,
    ifMaster,
    themeColor,
    ifShowComment,
    ifShowPostEditor,
    ifShowDialog,
    loadState,
    editorType,
    setPostEditorState,
    setCommentState,
  };
}

