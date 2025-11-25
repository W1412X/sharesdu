<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <EditFinishDialog
        :if-show="ifShowEditFinishCard"
        :theme-color="themeColor"
        @to-self-page="handleToSelfPage"
        @to-article-page="handleToArticlePage"
      />
      <ConfirmLeaveDialog
        :if-show="ifShowConfirmLeave"
        :theme-color="themeColor"
        @confirm-leave="handleConfirmLeave"
        @cancel-leave="handleCancelLeave"
      />
    </div>
  </v-dialog>
  <div class="full-center">
    <v-card elevation="0" class="full-card">
      <EditorHeader
        :editor-btn-text="editorBtnText"
        :title="editorData.title"
        :device-type="deviceType"
        @shift-editor-type="handleShiftEditorType"
        @update:title="handleUpdateTitle"
      />
      <html-editor
        v-if="editorType === 'html'"
        ref="htmlEditorRef"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
        :init-data="htmlData"
      ></html-editor>
      <md-editor
        v-if="editorType === 'md'"
        ref="mdEditorRef"
        :init-data="mdData"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
      ></md-editor>
      <editor-bar
        ref="editorBarRef"
        :title="editorData.title"
        :init-data="editorBarData"
        @set_loading="handleSetLoading"
        @alert="handleAlert"
      ></editor-bar>
      <v-btn @click="handleSubmit" class="submit-btn" :color="themeColor" variant="outlined">
        发布文章
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { getLoadMsg, getCancelLoadMsg, openPage } from '@/utils/other';
import EditorBar from '@/components/article/EditorBar.vue';
import HtmlEditor from '@/components/article/HtmlEditor.vue';
import MdEditor from '@/components/article/MdEditor.vue';
import { EditFinishDialog, ConfirmLeaveDialog, EditorHeader } from './components';
import {
  useEditorState,
  useEditorData,
  useEditorLoad,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'EditorPage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 编辑器引用
const htmlEditorRef = ref(null);
const mdEditorRef = ref(null);
const editorBarRef = ref(null);

// 使用 Composables
const {
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
} = useEditorState();

const {
  articleId,
  editorData,
  editorBarData,
  htmlData,
  mdData,
  setArticleId,
  setTitle,
  setHtmlContent,
  setMdContent,
  setEditorBarData,
  // eslint-disable-next-line no-unused-vars
  getCurrentContent,
} = useEditorData();

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 加载逻辑
const { loadArticle, submitArticle, shiftEditorType } = useEditorLoad(
  articleId,
  editorData,
  editorBarData,
  htmlData,
  mdData,
  editorType,
  apiUrl,
  htmlEditorRef,
  mdEditorRef,
  editorBarRef,
  ifSubmit,
  setArticleId,
  setTitle,
  setHtmlContent,
  setMdContent,
  setEditorBarData,
  setEditorType,
  setEditFinishCardState,
  handleSetLoading,
  handleAlert
);


// 处理切换编辑器类型
const handleShiftEditorType = () => {
  shiftEditorType();
};

// 处理更新标题
const handleUpdateTitle = (title) => {
  setTitle(title);
};

// 处理提交
const handleSubmit = async () => {
  await submitArticle(route.params.id);
};

// 处理跳转到主页
const handleToSelfPage = () => {
  openPage('router', {
    name: 'SelfPage',
  });
};

// 处理跳转到文章页
const handleToArticlePage = () => {
  openPage('router', {
    name: 'ArticlePage',
    params: { id: articleId.value },
  });
};

// 处理确认离开
const handleConfirmLeave = () => {
  ifConfirmLeave.value = true;
  if (nextPage.value) {
    openPage('router', nextPage.value);
  }
};

// 处理取消离开
const handleCancelLeave = () => {
  setConfirmLeaveState(false);
  nextPage.value = null;
};

// 处理页面卸载警告
const handleBeforeUnload = (event) => {
  event.preventDefault();
  event.returnValue = '离开此页面编辑的内容将会丢失';
};

// 路由离开前检查
onBeforeRouteLeave((to, from, next) => {
  try {
    if (ifSubmit.value || ifConfirmLeave.value) {
      next();
    } else {
      next(false);
      nextPage.value = to;
      setConfirmLeaveState(true);
    }
  } catch (e) {
    next();
  }
});

// 初始化页面
const initPage = async () => {
  handleSetLoading(getLoadMsg('正在加载编辑器...'));
  
  const routeId = route.params.id;
  if (routeId) {
    // 编辑模式：加载文章详情
    await loadArticle(routeId);
  } else {
    // 创建模式：提示加载成功
    handleAlert({
      state: true,
      color: 'info',
      title: '加载成功',
      content: '已加载编辑器',
    });
  }
  
  handleSetLoading(getCancelLoadMsg());
};

// 页面加载时初始化
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  await initPage();
});

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.full-card {
  padding: 5px;
  height: fit-content;
  border: grey 1px solid;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.submit-btn {
  width: 98%;
  margin: 5px;
}

@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .full-card {
    width: 1000px;
  }
}

@media screen and (max-width: 1000px) {
  .full-center {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
  }

  .full-card {
    padding: 0.5vw;
    width: 100vw;
  }

  .submit-btn {
    height: 30px;
    margin: 5px;
  }
}
</style>

