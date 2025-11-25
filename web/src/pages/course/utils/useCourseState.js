/**
 * CoursePage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';

export function useCourseState() {
  // 用户信息
  const userId = getCookie('userId');
  const userName = getCookie('userName');
  const ifMaster = getCookie('ifMaster');
  
  // 主题颜色和设备类型
  const themeColor = globalProperties.$themeColor;
  const deviceType = globalProperties.$deviceType;
  
  // 尺寸配置
  const smallStarSize = deviceType === 'mobile' ? 20 : 30;
  const barHeight = deviceType === 'mobile' ? 8 : 11;
  const bigScoreBarSize = deviceType === 'mobile' ? 30 : 40;
  
  // 对话框状态
  const ifShowCommentEditor = ref(false);
  const ifShowPostEditor = ref(false);
  const ifShowPost = ref(false);
  const ifShowCourseEditor = ref(false);
  const ifShowHistory = ref(false);
  const ifShowPosterDisplayer = ref(false);
  
  // 计算属性：是否有任何对话框打开
  const ifShowDialog = computed(() => {
    return (
      ifShowCommentEditor.value ||
      ifShowPostEditor.value ||
      ifShowCourseEditor.value ||
      ifShowHistory.value ||
      ifShowPosterDisplayer.value
    );
  });
  
  // 设置对话框状态的方法
  const setCommentEditorState = (state) => {
    ifShowCommentEditor.value = state;
  };
  
  const setPostEditorState = (state) => {
    ifShowPostEditor.value = state;
  };
  
  const setPostState = (state) => {
    ifShowPost.value = state;
  };
  
  const setCourseEditorState = (state) => {
    ifShowCourseEditor.value = state;
  };
  
  const setHistoryState = (state) => {
    ifShowHistory.value = state;
  };
  
  const setPosterDisplayerState = (state) => {
    ifShowPosterDisplayer.value = state;
  };
  
  return {
    userId,
    userName,
    ifMaster,
    themeColor,
    deviceType,
    smallStarSize,
    barHeight,
    bigScoreBarSize,
    ifShowCommentEditor,
    ifShowPostEditor,
    ifShowPost,
    ifShowCourseEditor,
    ifShowHistory,
    ifShowPosterDisplayer,
    ifShowDialog,
    setCommentEditorState,
    setPostEditorState,
    setPostState,
    setCourseEditorState,
    setHistoryState,
    setPosterDisplayerState,
  };
}

