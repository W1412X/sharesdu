<template>
  <v-dialog v-model="ifShowDialog" class="post-dialog">
    <div class="dialog-card-container">
      <ReplyEditorDialog
        v-model:if-show="ifShowCommentEditor"
        :comment="inputingComment"
        :loading="loading.submitReply"
        @submit="handleSubmitReply"
        @close="handleCloseEditor"
      />
      <ParentReplyDialog
        v-if="ifShowParentReply"
        :if-show="ifShowParentReply"
        :parent-reply="parentReply"
        :post-id="post.id"
        :theme-color="themeColor"
        @close="handleCloseParentReply"
        @show-parent="handleShowParent"
        @reply="handleAddReply"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
      />
    </div>
  </v-dialog>
  <div class="full-center">
    <div class="column-div">
      <!-- 帖子头部 -->
      <PostHeader
        :post="post"
        :load-state="loadState.post"
        :theme-color="themeColor"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
        @to-relative="handleToRelative"
      />
      
      <!-- 底部操作栏 -->
      <PostActions
        :post="post"
        :user-name="userName"
        :user-id="userId"
        @delete-post="handleDeletePost"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
        @show-comment-editor="handleShowCommentEditor"
      />
      
      <!-- 回复列表 -->
      <ReplyList
        :reply-list="replyList"
        :post-id="post.id"
        :loading="loading.loadReply"
        :all-load="allLoad.reply"
        :theme-color="themeColor"
        @show-parent="handleShowParent"
        @reply="handleAddReply"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
        @load-more="handleLoadMoreReply"
      />
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { openPage } from '@/utils/other';
import {
  PostHeader,
  ReplyList,
  ReplyEditorDialog,
  PostActions,
  ParentReplyDialog,
} from './components';
import {
  usePostState,
  usePostData,
  usePostLoad,
  usePostRestore,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'PostPage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 使用 Composables
const { userId, userName, themeColor, ifShowCommentEditor, ifShowParentReply, ifShowDialog, setCommentEditorState, setParentReplyState } = usePostState();

const {
  post,
  replyList,
  replyPageNum,
  parentReply,
  inputingComment,
  loading,
  allLoad,
  loadState,
  setPost,
  addReply,
  addReplies,
  setParentReply,
  resetComment,
  // eslint-disable-next-line no-unused-vars
  setComment,
} = usePostData();

// 帖子ID
const postId = ref(null);

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 恢复机制
const { restoreState, saveState, shouldRestore, getTargetPageNum } = usePostRestore(postId);

// 加载逻辑
const { loadPost, loadMoreReply, submitReply, loadParentReply, glideLoad } = usePostLoad(
  post,
  replyList,
  replyPageNum,
  allLoad,
  loading,
  loadState,
  parentReply,
  inputingComment,
  setPost,
  addReply,
  addReplies,
  setParentReply,
  resetComment,
  handleSetLoading,
  handleAlert
);

// 处理提交回复
const handleSubmitReply = async () => {
  const success = await submitReply(postId.value);
  if (success) {
    setCommentEditorState(false);
  }
};

// 处理关闭编辑器
const handleCloseEditor = () => {
  resetComment();
  setCommentEditorState(false);
};

// 处理显示评论编辑器
const handleShowCommentEditor = () => {
  setCommentEditorState(true);
};

// 处理显示父级回复
const handleShowParent = async (replyId) => {
  const success = await loadParentReply(replyId);
  if (success) {
    setParentReplyState(true);
  }
};

// 处理关闭父级回复
const handleCloseParentReply = () => {
  setParentReply(null);
  setParentReplyState(false);
};

// 处理添加回复
const handleAddReply = (reply) => {
  addReply(reply);
};

// 处理加载更多回复
const handleLoadMoreReply = async () => {
  await loadMoreReply(postId.value);
};

// 处理跳转到关联页面
const handleToRelative = () => {
  if (post.value.relativeLink) {
    openPage('url', { url: post.value.relativeLink });
  }
};

// 处理删除帖子
const handleDeletePost = () => {
  openPage('router', {
    name: 'IndexPage',
  });
};

// 初始化页面
const initPage = async () => {
  if (!route.params.id) {
    openPage('router', {
      name: 'ErrorPage',
      params: { reason: '未指定资源参数!' },
    });
    return;
  }

  postId.value = route.params.id;
  post.value.id = postId.value;

  // 尝试恢复状态
  const restoredState = restoreState();
  
  if (shouldRestore(restoredState)) {
    // 恢复状态
    const targetReplyPageNum = getTargetPageNum(restoredState.pageNum, 'reply');
    
    // 并行加载数据
    await Promise.all([
      loadPost(postId.value),
      loadMoreReply(postId.value, targetReplyPageNum),
    ]);
    
    // 恢复滚动位置
    await nextTick();
    if (restoredState.scrollTop > 0) {
      const scrollingElement = document.getElementById('router-view-container');
      if (scrollingElement) {
        scrollingElement.scrollTop = restoredState.scrollTop;
      }
    }
  } else {
    // 首次加载
    await Promise.all([
      loadPost(postId.value),
      loadMoreReply(postId.value),
    ]);
  }
};

// 保存状态
const savePageState = () => {
  const scrollingElement = document.getElementById('router-view-container');
  const scrollTop = scrollingElement?.scrollTop || 0;
  
  saveState({
    pageNum: {
      reply: replyPageNum.value,
    },
    scrollTop,
  });
};

// 路由离开前保存状态
onBeforeRouteLeave(() => {
  savePageState();
});

// 组件卸载时保存状态
onUnmounted(() => {
  savePageState();
  const routerContainer = document.getElementById('router-view-container');
  if (routerContainer) {
    routerContainer.removeEventListener('scroll', () => {
      glideLoad(postId.value);
    });
  }
});

// 页面加载时初始化
onMounted(async () => {
  await initPage();
  
  // 添加滚动监听
  const routerContainer = document.getElementById('router-view-container');
  if (routerContainer) {
    routerContainer.addEventListener('scroll', () => {
      glideLoad(postId.value);
    });
  }
});
</script>

<style scoped>
.post-dialog {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.column-div {
  display: flex;
  flex-direction: column;
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
</style>

