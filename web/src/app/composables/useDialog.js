/**
 * 对话框管理 Composable
 */
import { ref, computed } from 'vue';

export function useDialog() {
  const ifShowHistory = ref(false);
  const ifShowCourseEditor = ref(false);
  const ifShowPostEditor = ref(false);
  
  const ifShowDialog = computed(() => {
    return ifShowHistory.value || ifShowCourseEditor.value || ifShowPostEditor.value;
  });
  
  const setShowHistoryState = (state) => {
    ifShowHistory.value = state;
  };
  
  const setPostEditorState = (state) => {
    ifShowPostEditor.value = state;
  };
  
  const setCourseEditorState = (state) => {
    ifShowCourseEditor.value = state;
  };
  
  const closeDialog = () => {
    setShowHistoryState(false);
    setPostEditorState(false);
    setCourseEditorState(false);
  };
  
  return {
    ifShowDialog,
    ifShowHistory,
    ifShowCourseEditor,
    ifShowPostEditor,
    setShowHistoryState,
    setPostEditorState,
    setCourseEditorState,
    closeDialog,
  };
}

