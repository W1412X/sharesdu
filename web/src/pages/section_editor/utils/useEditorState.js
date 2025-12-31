/**
 * EditorPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

export function useEditorState() {
  // 主题颜色和设备类型
  const themeColor = globalProperties.$themeColor;
  const deviceType = globalProperties.$deviceType;
  const apiUrl = globalProperties.$apiUrl;
  
  // 编辑器类型（html/md）
  const editorType = ref('html');
  
  // 计算属性：编辑器切换按钮文本
  const editorBtnText = computed(() => {
    return editorType.value === 'html' ? '使用Markdown' : '使用富文本';
  });
  
  // 对话框状态
  const ifShowEditFinishCard = ref(false);
  const ifShowConfirmLeave = ref(false);
  
  // 计算属性：是否有任何对话框打开
  const ifShowDialog = computed(() => {
    return ifShowEditFinishCard.value || ifShowConfirmLeave.value;
  });
  
  // 离开确认状态
  const ifConfirmLeave = ref(false);
  const ifSubmit = ref(false);
  const nextPage = ref(null);
  
  // 设置对话框状态的方法
  const setEditFinishCardState = (state) => {
    ifShowEditFinishCard.value = state;
  };
  
  const setConfirmLeaveState = (state) => {
    ifShowConfirmLeave.value = state;
  };
  
  const setEditorType = (type) => {
    editorType.value = type;
  };
  
  return {
    themeColor,
    deviceType,
    apiUrl,
    editorType,
    editorBtnText,
    ifShowEditFinishCard,
    ifShowConfirmLeave,
    ifShowDialog,
    ifConfirmLeave,
    ifSubmit,
    nextPage,
    setEditFinishCardState,
    setConfirmLeaveState,
    setEditorType,
  };
}


