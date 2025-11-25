/**
 * PostPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';

export function usePostState() {
  // 用户信息
  const userId = getCookie('userId');
  const userName = getCookie('userName') || '游客';
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 对话框状态
  const ifShowCommentEditor = ref(false);
  const ifShowParentReply = ref(false);
  
  // 计算属性：是否有任何对话框打开
  const ifShowDialog = computed(() => {
    return ifShowCommentEditor.value || ifShowParentReply.value;
  });
  
  // 设置对话框状态的方法
  const setCommentEditorState = (state) => {
    ifShowCommentEditor.value = state;
  };
  
  const setParentReplyState = (state) => {
    ifShowParentReply.value = state;
  };
  
  return {
    userId,
    userName,
    themeColor,
    ifShowCommentEditor,
    ifShowParentReply,
    ifShowDialog,
    setCommentEditorState,
    setParentReplyState,
  };
}


