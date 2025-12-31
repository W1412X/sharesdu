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
    <v-card elevation="0" class="section-editor-card">
      <!-- 板块概念介绍 -->
      <SectionIntroduction :theme-color="themeColor" />
      
      <!-- 板块信息编辑部分 -->
      <section-info-editor
        ref="sectionInfoEditorRef"
        :init-data="editorBarData"
        @update:data="handleInfoDataChange"
        @alert="handleAlert"
      ></section-info-editor>
      
      <!-- 编辑器类型切换 -->
      <div class="editor-type-switch">
        <v-btn 
          @click="handleShiftEditorType" 
          class="editor-type-btn" 
          variant="tonal"
          :color="themeColor">
          {{ editorBtnText }}
        </v-btn>
      </div>
      
      <!-- 板块详细介绍编辑器 -->
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
      
      <!-- 提交按钮 -->
      <div class="submit-section">
        <v-btn @click="handleSubmit" class="submit-btn" :color="themeColor" variant="elevated" size="large">
          <v-icon icon="mdi-publish" size="20"></v-icon>
          <span>发布板块</span>
      </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { getLoadMsg, getCancelLoadMsg, openPage } from '@/utils/other';
import HtmlEditor from '@/components/article/HtmlEditor.vue';
import MdEditor from '@/components/article/MdEditor.vue';
import { EditFinishDialog, ConfirmLeaveDialog, SectionIntroduction, SectionInfoEditor } from './components';
import {
  useEditorState,
  useEditorData,
  useEditorLoad,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'SectionEditorPage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 编辑器引用
const htmlEditorRef = ref(null);
const mdEditorRef = ref(null);
const sectionInfoEditorRef = ref(null);

// 使用 Composables
const {
  themeColor,
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

// 监听板块名称变化，同步到标题
watch(
  () => editorBarData.value.articleSection,
  (newSectionName) => {
    if (newSectionName && newSectionName.trim() && newSectionName !== 'default') {
      setTitle(newSectionName);
    } else {
      setTitle('');
    }
  },
  { immediate: true }
);

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
  sectionInfoEditorRef,
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

// 处理板块信息数据变化
const handleInfoDataChange = (data) => {
  setEditorBarData({
    ...editorBarData.value,
    ...data,
  });
  // 同步标题
  if (data.articleSection && data.articleSection.trim() && data.articleSection !== 'default') {
    setTitle(data.articleSection);
  } else {
    setTitle('');
  }
};

// 处理切换编辑器类型
const handleShiftEditorType = () => {
  shiftEditorType();
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

.section-editor-card {
  padding: 0;
  height: fit-content;
  border: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.editor-type-switch {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.editor-type-btn {
  width: 100%;
}

.submit-section {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  min-width: 160px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .section-editor-card {
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

  .section-editor-card {
    width: 100vw;
    border: none;
    border-radius: 0;
  }
  
  .editor-type-switch {
    padding: 12px 16px;
  }
  
  .editor-type-btn {
    height: 36px;
    font-size: 14px;
  }
  
  .submit-section {
    padding: 16px;
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
  }
}
</style>
