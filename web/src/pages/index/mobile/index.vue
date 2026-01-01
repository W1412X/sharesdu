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
        <ArticleList
          v-if="itemType === 'article'"
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
        <div v-if="itemType === 'post'" class="post-container">
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
          v-if="itemType === 'course'"
          :course-list="courseList"
          :theme-color="themeColor"
          :all-load="allLoad.course"
          :loading="loading.course"
          @load-more="handleLoadMore('course')"
        />
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
      break;
    case 'course':
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

// 监听板块ID变化，刷新帖子列表
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
    const scrollPosition = document.getElementById('router-view-container').scrollTop; 
    console.log('scrollPosition', scrollPosition);
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
  
  // 添加滚动监听
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.addEventListener('scroll', glideLoad);
  }
});

// 卸载时清理
onUnmounted(() => {
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
</style>

