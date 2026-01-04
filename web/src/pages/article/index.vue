<template>
  <div class="full-center">
    <div class="column-div">
      <!-- 文章头部 -->
      <ArticleHeader
        :article="article"
        :if-master="ifMaster"
        :loading="loading"
        :theme-color="themeColor"
        @set-article-top="handleSetArticleTop"
        @to-origin-link="handleToOriginLink"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
      />
      
      <!-- 文章内容 -->
      <transition name="fade" mode="out-in">
      <article-display
        v-if="loadState"
          :key="article.id"
        class="margin-bottom-40px"
        :init-data="displayMsg"
      />
      </transition>
      
      <!-- 文章操作栏 -->
      <ArticleActions
        :article="article"
        :user-id="userId"
        :user-name="userName"
        :if-master="ifMaster"
        @edit="handleEdit"
        @delete="handleDelete"
        @comment="handleComment"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
      />
    </div>
  </div>
  
  <!-- 帖子列表 -->
  <PostList
    v-model:if-show="ifShowComment"
    :post-items="postItems"
    :if-parent-author="userId === article.authorId"
    :loading="loading.post"
    :all-load="allLoad.post"
    :theme-color="themeColor"
    @open-editor="handleOpenEditor"
    @load-more="handleLoadMorePost"
    @alert="handleAlert"
    @set-post-top="handleSetPostTop"
  />
  
  <!-- 帖子编辑器对话框 -->
  <PostEditorDialog
    v-model:if-show="ifShowPostEditor"
    :article-id="article.id"
    @close="handleCloseEditor"
    @add-post="handleAddPost"
    @set-loading="handleSetLoading"
    @alert="handleAlert"
  />
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, openPage } from '@/utils/other';
import { createOptimizedScroll } from '@/app/composables/useOptimizedScroll';
import { setArticleTop } from '@/api/modules/top';
// eslint-disable-next-line no-unused-vars
import { getLock } from '@/utils/lock';
import ArticleDisplay from '@/components/article/ArticleDisplay.vue';
import {
  ArticleHeader,
  ArticleActions,
  PostList,
  PostEditorDialog,
} from './components';
import {
  useArticleState,
  useArticleData,
  useArticleLoad,
  useArticleRestore,
} from './utils';
import { moreOptionEventBus } from '@/utils/eventBus';

// 定义组件名称
defineOptions({
  name: 'ArticlePage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 使用 Composables
const {
  userId,
  userName,
  ifMaster,
  themeColor,
  ifShowComment,
  ifShowPostEditor,
  // eslint-disable-next-line no-unused-vars
  ifShowDialog,
  loadState,
  editorType: editorTypeRef,
  setPostEditorState,
  setCommentState,
} = useArticleState();

const {
  article,
  articleResponse,
  postItems,
  postPageNum,
  loading,
  allLoad,
  setArticle,
  addPost,
  addPosts,
  setPostTop,
  // eslint-disable-next-line no-unused-vars
  resetPosts,
} = useArticleData();

// 计算显示消息
const displayMsg = computed(() => {
  return {
    type: editorTypeRef.value,
    content: article.value.content,
  };
});

// 页面恢复机制
const articleId = computed(() => route.params.id || '');
const {
  isRestoring,
  restoreComplete,
  restoreState,
  saveState,
  shouldRestore,
  getTargetPageNum,
} = useArticleRestore(articleId);

// 加载逻辑
const { loadArticle, loadMorePost } = useArticleLoad(
  article,
  articleResponse,
  postItems,
  postPageNum,
  allLoad,
  loading,
  setArticle,
  addPosts,
  (msg) => emit('alert', msg)
);

// 处理设置文章置顶
const handleSetArticleTop = async () => {
  if (!ifMaster) {
    emit('alert', getNormalErrorAlert('您不是管理员，无法执行此操作'));
    return;
  }
  
  loading.value.top = true;
  try {
    const response = await setArticleTop(article.value.id, !article.value.ifTop);
    if (response.status === 200) {
      article.value.ifTop = !article.value.ifTop;
      emit('alert', getNormalSuccessAlert(article.value.ifTop ? '置顶成功' : '取消置顶成功'));
    } else {
      emit('alert', getNormalErrorAlert(response.message));
    }
  } catch (error) {
    emit('alert', getNormalErrorAlert(error.message || '操作失败'));
  } finally {
    loading.value.top = false;
  }
};

// 处理跳转到原文链接
const handleToOriginLink = () => {
  openPage('url', { url: article.value.originLink });
};

// 处理编辑
const handleEdit = () => {
  emit('set_loading', getLoadMsg('正在加载编辑器...'));
  openPage('router', {
    name: 'EditorPage',
    params: {
      id: article.value.id,
    },
  });
};

// 处理删除
const handleDelete = () => {
  openPage('router', {
    name: 'IndexPage',
  });
};

// 处理评论
const handleComment = () => {
  setCommentState(true);
  if (postPageNum.value === 1) {
    handleLoadMorePost();
  }
};

// 处理加载更多帖子
const handleLoadMorePost = async () => {
  await loadMorePost(article.value.id);
};

// 处理打开编辑器
const handleOpenEditor = () => {
  setPostEditorState(true);
};

// 处理关闭编辑器
const handleCloseEditor = () => {
  setPostEditorState(false);
};

// 处理添加帖子
const handleAddPost = (post) => {
  addPost(post);
};

// 处理设置帖子置顶
const handleSetPostTop = (msg) => {
  setPostTop(msg);
};

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理设置加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 滚动加载（使用优化的滚动监听）
let postScrollInstance = null;

// 监听评论状态变化，添加/移除滚动监听
watch(ifShowComment, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      // 如果已经存在实例，先清理
      if (postScrollInstance) {
        postScrollInstance.cleanup();
      }
      // 使用优化的滚动监听（动态创建）
      postScrollInstance = createOptimizedScroll({
        onReachBottom: () => {
          handleLoadMorePost();
        },
        containerSelector: '#post-container',
        threshold: 200,
        throttleDelay: 100,
      });
    }, 100);
  } else {
    // 清理滚动监听
    if (postScrollInstance) {
      postScrollInstance.cleanup();
      postScrollInstance = null;
    }
  }
});

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
    const scrollElement = document.getElementById('router-view-container');
    const scrollTop = scrollElement?.scrollTop || 0;
    
    let postScrollTop = 0;
    if (ifShowComment.value) {
      const postContainer = document.getElementById('post-container');
      postScrollTop = postContainer?.scrollTop || 0;
    }
    
    saveState({
      commentState: ifShowComment.value,
      pageNum: {
        post: postPageNum.value,
      },
      scrollTop: scrollTop,
      postScrollTop: postScrollTop,
    });
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  next();
});

// 挂载时恢复状态
onMounted(async () => {

  emit('set_loading', getLoadMsg('正在加载文章信息...'));
  
  if (!route.params.id) {
    openPage('router', {
      name: 'ErrorPage',
      params: { reason: '缺少参数' },
    });
    emit('set_loading', getCancelLoadMsg());
    return;
  }
  
  // 加载文章详情
  const result = await loadArticle(route.params.id);
  if(article.value.section!='default'){
    openPage('router', {
      name: 'SectionPage',
      params: { id: result.id },
    });
    emit('set_loading', getCancelLoadMsg());
    return;
  }
  if (!result.success) {
    emit('set_loading', getCancelLoadMsg());
    return;
  }
  
  // 设置编辑器类型
  editorTypeRef.value = result.editorType || 'html';
  loadState.value = true;
  
  // 恢复状态
  const restoredState = restoreState();
  
  if (shouldRestore(restoredState)) {
    isRestoring.value = true;
    
    // 恢复评论状态
    setCommentState(restoredState.commentState);
    
    // 如果之前打开了评论，需要加载帖子
    if (restoredState.commentState) {
      const targetPageNum = getTargetPageNum(restoredState.pageNum);
      
      // 先加载第一页
      await loadMorePost(article.value.id);
      
      // 如果目标页码大于当前页码，继续加载
      if (targetPageNum > postPageNum.value) {
        while (postPageNum.value < targetPageNum && !allLoad.value.post) {
          await loadMorePost(article.value.id, targetPageNum);
        }
      }
      
      // 等待 DOM 更新后恢复滚动位置
      await nextTick();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const postContainer = document.getElementById('post-container');
          if (postContainer) {
            postContainer.scrollTop = restoredState.postScrollTop || 0;
          }
          const scrollElement = document.getElementById('router-view-container');
          if (scrollElement) {
            scrollElement.scrollTop = restoredState.scrollTop || 0;
          }
          isRestoring.value = false;
          restoreComplete.value = true;
        });
      });
    } else {
      // 恢复主页面滚动位置
      await nextTick();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollElement = document.getElementById('router-view-container');
          if (scrollElement) {
            scrollElement.scrollTop = restoredState.scrollTop || 0;
          }
          isRestoring.value = false;
          restoreComplete.value = true;
        });
      });
    }
  } else {
    restoreComplete.value = true;
  }
  moreOptionEventBus.emit("article",article.value);
  emit('set_loading', getCancelLoadMsg());
});

// 卸载时清理
onUnmounted(() => {
  // 清理滚动监听
  if (postScrollInstance) {
    postScrollInstance.cleanup();
    postScrollInstance = null;
  }
});
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.margin-bottom-40px {
  margin-bottom: 40px;
}

@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
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
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

