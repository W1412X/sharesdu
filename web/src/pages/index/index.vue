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
        <PostList
          v-if="itemType === 'post'"
          :post-list="postList"
          :theme-color="themeColor"
          :all-load="allLoad.post"
          :loading="loading.post"
          @load-more="handleLoadMore('post')"
        />
        <CourseList
          v-if="itemType === 'course'"
          :course-list="courseList"
          :theme-color="themeColor"
          :all-load="allLoad.course"
          :loading="loading.course"
          @load-more="handleLoadMore('course')"
        />
        <SectionList
          v-if="itemType === 'section'"
          :section-list="sectionList"
          :theme-color="themeColor"
          :loading="loading.section"
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
import { ItemTypeTabs, ArticleList, PostList, CourseList, SectionList } from './components';
import { useIndexState, useIndexData, useIndexLoad, useIndexRestore } from './utils';

// 定义组件名称
defineOptions({
  name: 'IndexPage'
});

// 使用 Composables
const {
  itemType,
  articleSortMethod,
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
      if (postList.value.length === 0) {
        handleLoadMore('post');
      }
      break;
    case 'course':
      if (courseList.value.length === 0) {
        handleLoadMore('course');
      }
      break;
    case 'section':
      if (sectionList.value.length === 0) {
        handleLoadMore('section');
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
    lastPageNum.value = restoredState.pageNum;
    
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
}
</style>

