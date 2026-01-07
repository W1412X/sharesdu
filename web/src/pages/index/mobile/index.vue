<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
    </div>
  </v-dialog>
  <div class="full-screen">
    <ItemTypeTabs
      v-model="itemType"
      :if-mobile="ifMobile"
      :theme-color="themeColor"
    />
    <div class="row-center">
      <v-spacer></v-spacer>
      <div></div>
      <v-spacer></v-spacer>
      <v-pull-to-refresh 
        id="item-container" 
        :pull-down-threshold="64" 
        @load="handleRefresh" 
        style="margin-top: 40px;"
      >
        <transition name="tab-fade" mode="out-in">
        <ArticleList
          v-if="itemType === 'article'"
            :key="'article'"
          :article-list="articleList[articleSortMethod]"
          :sort-method="articleSortMethod"
          :theme-color="themeColor"
          :if-mobile="ifMobile"
          :all-load="allLoad.article[articleSortMethod]"
          :loading="loading.article"
          @update:sort-method="articleSortMethod = $event"
          @load-more="handleLoadMore('article')"
        />
        <!-- 帖子页面：包含板块选择器和帖子列表 -->
          <div v-else-if="itemType === 'post'" :key="'post'" class="post-container">
          <!-- 板块选择器 -->
          <SectionSelector
            :section-list="sectionList"
            v-model:selected-section-id="selectedSectionId"
            :theme-color="themeColor"
          />
          <!-- 帖子列表 -->
          <PostList
            :post-list="postList"
            :theme-color="themeColor"
            :all-load="allLoad.post"
            :loading="loading.post"
            @load-more="handleLoadMore('post')"
          />
        </div>
        <CourseList
            v-else-if="itemType === 'course'"
            :key="'course'"
          :course-list="courseList"
          :theme-color="themeColor"
          :all-load="allLoad.course"
          :loading="loading.course"
          @load-more="handleLoadMore('course')"
        />
        </transition>
      </v-pull-to-refresh>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { isElementAtBottom } from '@/utils/other';
import { ItemTypeTabs, ArticleList, PostList, CourseList, SectionSelector } from './components';
import { useIndexState, useIndexData, useIndexLoad, useIndexRestore } from '../utils';
import { usePostPolling } from '@/app/composables';
import { getPostListByArticleId } from '@/api/modules/article';

// 定义组件名称
defineOptions({
  name: 'IndexPageMobile'
});

// 使用 Composables
const {
  itemType,
  articleSortMethod,
  selectedSectionId,
  ifMounted,
  lastPageNum,
  ifMobile,
  themeColor,
} = useIndexState();

// 页面恢复机制
const {
  isRestoring,
  restoreComplete,
  restoreState,
  saveState,
  getTargetPageNum,
  shouldRestore,
} = useIndexRestore();

const {
  articleList,
  postList,
  courseList,
  sectionList,
  articlePageNum,
  postPageNum,
  coursePageNum,
  sectionPageNum,
  loading,
  allLoad,
  setArticles,
  addArticles,
  setPosts,
  addPosts,
  setCourses,
  addCourses,
  setSections,
  addSections,
  addPost,
} = useIndexData();

// 定义 emit
const emit = defineEmits(['alert', 'set_loading']);

// 对话框状态
const ifShowDialog = computed(() => false);

// 帖子轮询控制器
let postPollingController = null;

/**
 * 初始化帖子轮询服务
 */
const initPostPolling = () => {
  
  // 如果轮询控制器已存在，先停止
  if (postPollingController) {
    postPollingController.stopPolling();
  }
  
  // 创建获取帖子列表的函数（使用当前选中的板块ID）
  const fetchPostList = async (pageIndex, useCache) => {
    return await getPostListByArticleId(selectedSectionId.value, pageIndex, useCache);
  };
  
  // 创建获取当前帖子列表的函数
  const getPostList = () => {
    return postList.value;
  };
  
  // 创建设置帖子列表的函数（在列表顶部插入新帖子）
  const setPostList = (newPosts) => {
    postList.value.unshift(...newPosts);
  };
  
  // 创建 alert 函数
  const alertFn = (msg) => {
    emit('alert', msg);
  };
  
  // 初始化轮询
  postPollingController = usePostPolling(
    fetchPostList,
    getPostList,
    setPostList,
    alertFn,
    { interval: 60000 } // 1 分钟
  );
  
  
  // 仅在当前是帖子列表时启动轮询
  if (itemType.value === 'post') {
    postPollingController.startPolling();
  }
};

// 加载逻辑
const { refresh, loadMore, restoreScrollAndLoad, canLoadMore } = useIndexLoad(
  itemType,
  articleSortMethod,
  selectedSectionId,
  articleList,
  postList,
  courseList,
  sectionList,
  articlePageNum,
  postPageNum,
  coursePageNum,
  sectionPageNum,
  loading,
  allLoad,
  setArticles,
  addArticles,
  setPosts,
  addPosts,
  setCourses,
  addCourses,
  setSections,
  addSections,
  (msg) => emit('alert', msg)
);

// 处理刷新
const handleRefresh = async ({ done }) => {
  await refresh(itemType.value);
  
  // 如果是帖子列表，重置轮询基准
  if (itemType.value === 'post' && postPollingController) {
    postPollingController.resetBaseline();
  }
  
  done('ok');
};

// 处理加载更多
const handleLoadMore = async (type) => {
  await loadMore(type);
};

// 监听 itemType 变化
watch(itemType, (newVal) => {
  if (!ifMounted.value) {
    return;
  }
  
  switch (newVal) {
    case 'article':
      // 停止帖子轮询
      if (postPollingController) {
        postPollingController.stopPolling();
      }
      if (articleList.value[articleSortMethod.value].length === 0) {
        handleLoadMore('article');
      }
      break;
    case 'post':
      // 加载板块列表（如果还没有）
      if (sectionList.value.length === 0) {
        handleLoadMore('section');
      }
      // 加载帖子列表
      if (postList.value.length === 0) {
        handleLoadMore('post');
      }
      // 启动帖子轮询（如果轮询控制器已创建）
      if (postPollingController) {
        postPollingController.startPolling();
      } else {
        // 如果轮询控制器还未创建，初始化它
        initPostPolling();
      }
      break;
    case 'course':
      // 停止帖子轮询
      if (postPollingController) {
        postPollingController.stopPolling();
      }
      if (courseList.value.length === 0) {
        handleLoadMore('course');
      }
      break;
  }
}, { immediate: true });

// 监听 articleSortMethod 变化
watch(articleSortMethod, (newVal, oldVal) => {
  if (newVal === oldVal) {
    return;
  }
  if (articleList.value[articleSortMethod.value].length === 0) {
    handleLoadMore(itemType.value);
  }
});

// 监听板块ID变化，刷新帖子列表并重新初始化轮询
watch(selectedSectionId, (newId, oldId) => {
  if (newId === oldId || !ifMounted.value) {
    return;
  }
  // 切换板块时，清空帖子列表并重新加载
  if (itemType.value === 'post') {
    setPosts([]);
    postPageNum.value = 1;
    allLoad.value.post = false;
    handleLoadMore('post');
    
    // 重新初始化轮询（使用新的板块ID）
    initPostPolling();
  }
});

// 滚动加载
const glideLoad = () => {
  // 防止在其他加载未完成时加载
  if (!canLoadMore()) {
    return;
  }
  const container = document.getElementById('item-container');
  if (container && isElementAtBottom(container)) {
    handleLoadMore(itemType.value);
  }
};

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
    // 停止帖子轮询
    if (postPollingController) {
      postPollingController.stopPolling();
    }
    
    const scrollPosition = document.getElementById('router-view-container').scrollTop; 
    saveState({
      itemType: itemType.value,
      pageNum: {
        article: articlePageNum.value,
        post: postPageNum.value,
        course: coursePageNum.value,
      },
      scrollPosition: scrollPosition,
      articleSortMethod: articleSortMethod.value,
      selectedSectionId: selectedSectionId.value,
    });
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  next();
});

// 挂载时恢复状态（优化版）
onMounted(async () => {
  const restoredState = restoreState();
  
  // 设置页面标题
  const webTitle = document.getElementById('web-title');
  if (webTitle) {
    webTitle.innerText = 'ShareSDU | 首页';
  }
  
  if (shouldRestore(restoredState)) {
    // 需要恢复状态
    isRestoring.value = true;
    
    // 恢复基本状态
    itemType.value = restoredState.itemType;
    articleSortMethod.value = restoredState.articleSortMethod;
    selectedSectionId.value = restoredState.selectedSectionId || 20;
    lastPageNum.value = restoredState.pageNum;
    
    // 如果是帖子页面，先加载板块列表
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    
    // 先加载第一页数据（快速显示）
    await handleLoadMore(itemType.value);
    
    // 等待 DOM 更新
    await nextTick();
    
    // 恢复滚动位置并加载到目标页码
    const targetPageNum = getTargetPageNum(
      itemType.value,
      restoredState.pageNum,
      {
        article: articlePageNum.value,
        post: postPageNum.value,
        course: coursePageNum.value,
      },
      articleSortMethod.value
    );
    
    // 如果目标页码大于1，需要加载更多
    if (targetPageNum > 1) {
      await restoreScrollAndLoad(
        itemType.value,
        restoredState.pageNum,
      );
    }
    
    // 等待所有数据加载完成后再恢复滚动位置
    await nextTick();
    
    // 使用 requestAnimationFrame 确保 DOM 完全渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollElement = document.getElementById('router-view-container');
        if (scrollElement) {
          scrollElement.scrollTop = restoredState.scrollPosition || 0;
        }
        isRestoring.value = false;
        restoreComplete.value = true;
      });
    });
  } else {
    // 不需要恢复，正常加载
    // 如果是帖子页面，先加载板块列表
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    await handleLoadMore(itemType.value);
    restoreComplete.value = true;
  }
  
  ifMounted.value = true;
  
  // 初始化帖子轮询（仅在帖子列表时启用）
  if (itemType.value === 'post') {
    initPostPolling();
  }
  
  // 添加滚动监听
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.addEventListener('scroll', glideLoad);
  }
});

// 卸载时清理
onUnmounted(() => {
  // 停止帖子轮询
  if (postPollingController) {
    postPollingController.stopPolling();
  }
  
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.removeEventListener('scroll', glideLoad);
  }
});

// 暴露方法供外部调用
defineExpose({
  addPost,
});
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .full-screen {
    width: 100%;
    height: 100%;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .full-screen {
    width: 100vw;
    height: 100vh;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }

  .post-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

/* 选项卡切换过渡动画 */
.tab-fade-enter-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.tab-fade-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

