<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <CommentEditorDialog
        v-model:if-show="ifShowCommentEditor"
        :self-comment="selfComment"
        :loading="loading.submitEvaluation"
        :theme-color="themeColor"
        @submit="handleSubmitComment"
        @close="handleCloseEditor"
      />
      <PosterDisplayer
        v-if="ifShowPosterDisplayer"
        :imageUrl="posterImageUrl"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
        @close="handleClosePosterDisplayer"
      />
      <post-editor
        v-if="ifShowPostEditor"
        @add_post="handleAddPost"
        @close="handleClosePostEditor"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
        :type-msg="{ type: 'course', id: course.id }"
      />
      <course-editor
        v-if="ifShowCourseEditor"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
        :init-data="course"
        @close="setCourseEditorState(false)"
      />
      <course-history-card
        v-if="ifShowHistory"
        :id="course.id"
        @close="setHistoryState(false)"
        @set_loading="handleSetLoading"
        @alert="handleAlert"
      />
    </div>
  </v-dialog>
  <div class="full-center">
    <div class="column-div">
      <!-- 课程头部 -->
      <CourseHeader
        :course="course"
        :load-state="loadState.course"
        :theme-color="themeColor"
        :bar-height="barHeight"
        :big-score-bar-size="bigScoreBarSize"
        @generate-share-image="handleGenerateShareImage"
        @edit-course="setCourseEditorState(true)"
        @show-history="setHistoryState(true)"
        @alert="handleAlert"
        @set-loading="handleSetLoading"
      />
      
      <!-- 用户自己的评价 -->
      <SelfCommentCard
        :self-comment="selfComment"
        :if-rated="ifRated"
        :load-state="loadState.selfComment"
        :theme-color="themeColor"
        @edit-comment="setCommentEditorState(true)"
      />
      
      <!-- 评论列表 -->
      <CommentList
        :comment-list="commentList"
        :loading="loading.loadEvaluation"
        :all-load="allLoad.comment"
        :theme-color="themeColor"
        @load-more="handleLoadMoreComments"
      />
      
      <!-- 操作栏 -->
      <CourseActions
        :course="course"
        :user-name="userName"
        :if-master="ifMaster"
        @show-post="handleShowPost"
      />
    </div>
  </div>
  <PostListDialog
    v-model:if-show="ifShowPost"
    :post-items="postItems"
    :if-parent-author="ifMaster"
    :loading="loading.post"
    :all-load="allLoad.post"
    :theme-color="themeColor"
    @open-editor="setPostEditorState(true)"
    @load-more="handleLoadMorePosts"
    @alert="handleAlert"
    @set-post-top="handleSetPostTop"
  />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useOptimizedScroll, createOptimizedScroll } from '@/app/composables/useOptimizedScroll';
import PostEditor from '@/components/post/PostEditor.vue';
import CourseEditor from '@/components/course/CourseEditor.vue';
import CourseHistoryCard from '@/components/course/CourseHistoryCard.vue';
import PosterDisplayer from '@/components/common/PosterDisplayer.vue';
import {
  CourseHeader,
  CourseActions,
  SelfCommentCard,
  CommentList,
  CommentEditorDialog,
  PostListDialog,
} from './components';
import {
  useCourseState,
  useCourseData,
  useCourseLoad,
  useCourseRestore,
} from './utils';
import { moreOptionEventBus } from '@/utils/eventBus';

// 定义组件名称
defineOptions({
  name: 'CoursePage',
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 路由
const route = useRoute();

// 使用 Composables
const {
  userName,
  ifMaster,
  themeColor,
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
} = useCourseState();

const {
  course,
  selfComment,
  oriSelfComment,
  ifRated,
  commentList,
  commentPageNum,
  postItems,
  postPageNum,
  loading,
  allLoad,
  loadState,
  posterImageUrl,
  setCourse,
  setSelfComment,
  updateSelfComment,
  resetSelfComment,
  setIfRated,
  addComments,
  addPost,
  addPosts,
  setPostTop,
} = useCourseData();

// 课程ID
const courseId = ref(null);

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 恢复机制
const { restoreState, saveState, shouldRestore, getTargetPageNum } = useCourseRestore(courseId);

// 加载逻辑
const {
  loadCourse,
  loadSelfComment,
  loadMoreComments,
  loadMorePosts,
  submitComment,
  generateShareImage,
  glideLoad,
} = useCourseLoad(
  course,
  selfComment,
  oriSelfComment,
  ifRated,
  commentList,
  commentPageNum,
  postItems,
  postPageNum,
  allLoad,
  loading,
  loadState,
  posterImageUrl,
  setCourse,
  setSelfComment,
  updateSelfComment,
  resetSelfComment,
  setIfRated,
  addComments,
  addPosts,
  setPosterDisplayerState,
  handleSetLoading,
  handleAlert
);

// 处理提交评价
const handleSubmitComment = async (value) => {
  selfComment.value = value;
  const success = await submitComment(courseId.value);
  if (success) {
    setCommentEditorState(false);
  }
};

// 处理关闭编辑器
const handleCloseEditor = () => {
  resetSelfComment();
  setCommentEditorState(false);
};

// 处理添加帖子
const handleAddPost = (item) => {
  addPost(item);
  setPostEditorState(false);
};

// 处理关闭帖子编辑器
const handleClosePostEditor = () => {
  setPostEditorState(false);
};

// 处理关闭海报显示
const handleClosePosterDisplayer = () => {
  setPosterDisplayerState(false);
  if (posterImageUrl.value) {
    URL.revokeObjectURL(posterImageUrl.value);
  }
};

// 处理生成分享图片
const handleGenerateShareImage = async () => {
  await generateShareImage();
};

// 处理显示帖子
const handleShowPost = async () => {
  if (postItems.value.length === 0) {
    await loadMorePosts(courseId.value);
  }
  setPostState(true);
};

// 处理加载更多评论
const handleLoadMoreComments = async () => {
  await loadMoreComments(courseId.value);
};

// 处理加载更多帖子
const handleLoadMorePosts = async () => {
  await loadMorePosts(courseId.value);
};

// 处理设置帖子置顶
const handleSetPostTop = (msg) => {
  setPostTop(msg);
};

// 初始化页面
const initPage = async () => {
  courseId.value = route.params.id;
  
  // 尝试恢复状态
  const restoredState = restoreState();
  
  if (shouldRestore(restoredState)) {
    // 恢复状态
    setPostState(restoredState.postState);
    const targetCommentPageNum = getTargetPageNum(restoredState.pageNum, 'comment');
    const targetPostPageNum = getTargetPageNum(restoredState.pageNum, 'post');
    
    // 并行加载数据
    await Promise.all([
      loadCourse(courseId.value),
      loadSelfComment(courseId.value),
      loadMoreComments(courseId.value, targetCommentPageNum),
    ]);
    
    // 如果帖子状态为打开，加载帖子
    if (restoredState.postState) {
      await loadMorePosts(courseId.value, targetPostPageNum);
    }
    
    // 恢复滚动位置
    await nextTick();
    const scrollingElement = document.getElementById('router-view-container');
    if (restoredState.scrollTop > 0) {
      if (scrollingElement) {
        scrollingElement.scrollTop = restoredState.scrollTop;
      }
    }
    if (restoredState.postState && restoredState.postScrollTop > 0) {
      const container = document.getElementById('post-container');
      if (container) {
        container.scrollTop = restoredState.postScrollTop;
      }
    }
  } else {
    // 首次加载
    await Promise.all([
      loadCourse(courseId.value),
      loadSelfComment(courseId.value),
      loadMoreComments(courseId.value),
    ]);
  }
};

// 保存状态
const savePageState = () => {
  const scrollingElement = document.getElementById('router-view-container');
  const scrollTop = scrollingElement?.scrollTop || 0;
  let postScrollTop = 0;
  if (ifShowPost.value) {
    const container = document.getElementById('post-container');
    postScrollTop = container?.scrollTop || 0;
  }
  
  saveState({
    pageNum: {
      post: postPageNum.value,
      comment: commentPageNum.value,
    },
    scrollTop,
    postState: ifShowPost.value,
    postScrollTop,
  });
};

// 监听帖子状态变化，添加/移除滚动监听（使用优化的滚动监听）
let postScrollInstance = null;

watch(
  ifShowPost,
  (newVal) => {
    try {
      if (newVal) {
        setTimeout(() => {
          // 如果已经存在实例，先清理
          if (postScrollInstance) {
            postScrollInstance.cleanup();
          }
          // 使用优化的滚动监听（动态创建）
          postScrollInstance = createOptimizedScroll({
            onReachBottom: () => {
              glideLoad(courseId.value, true);
            },
            containerSelector: '#post-container',
            threshold: 200,
            throttleDelay: 100,
          });
        }, 100);
      } else {
        // 清理帖子容器的滚动监听
        if (postScrollInstance) {
          postScrollInstance.cleanup();
          postScrollInstance = null;
        }
      }
    } catch (e) {
      // 忽略错误
    }
  },
  { immediate: false }
);

// 路由离开前保存状态
onBeforeRouteLeave(() => {
  savePageState();
});

// 滚动加载评论（使用优化的滚动监听）
useOptimizedScroll({
  onReachBottom: () => {
    glideLoad(courseId.value, false);
  },
  containerSelector: '#router-view-container',
  threshold: 200,
  throttleDelay: 100,
});

// 组件卸载时保存状态
onUnmounted(() => {
  savePageState();
  // 清理帖子容器的滚动监听
  if (postScrollInstance) {
    postScrollInstance.cleanup();
    postScrollInstance = null;
  }
  // router-view-container 的清理工作已由 useOptimizedScroll 处理
});

// 页面加载时初始化
onMounted(async () => {
  await initPage();
  moreOptionEventBus.emit("course",course.value);
  // 滚动监听已由 useOptimizedScroll 处理，这里不再需要手动添加
});
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.dialog-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
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

