<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
    </div>
  </v-dialog>
  <div class="full-screen">
    <div class="row-center">
      <v-spacer></v-spacer>
      <div></div>
      <v-spacer></v-spacer>
      <v-pull-to-refresh 
        id="item-container" 
        :pull-down-threshold="64" 
        @load="handleRefresh" 
        style="margin-top: 10px;"
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
        <!-- 帖子页面：两列布局，左侧帖子列表，右侧板块列表 -->
        <div v-if="itemType === 'post'" class="post-layout-container">
          <!-- 左侧：帖子列表 -->
          <div class="post-list-column">
            <PostList
              :post-list="postList"
              :theme-color="themeColor"
              :all-load="allLoad.post"
              :loading="loading.post"
              @load-more="handleLoadMore('post')"
            />
          </div>
          <!-- PC端分割线 -->
          <div class="post-section-divider"></div>
          <!-- 右侧：板块列表 -->
          <div class="section-list-column">
            <div class="section-list-header">
              <span class="text-title-bold">热门板块</span>
              <v-spacer></v-spacer>
              <v-btn variant="text" append-icon="mdi-chevron-right" :color="themeColor" class="text-small" text="查看全部" @click="handleViewAllSections"></v-btn>
            </div>
            <SectionList
              :section-list="sectionList"
              :theme-color="themeColor"
              :loading="loading.section"
            />
          </div>
        </div>
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
import { watch, onMounted, onUnmounted, nextTick, computed, inject } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { openPage } from '@/utils/other';
import { ArticleList, PostList, CourseList, SectionList } from './components';
import { useIndexState, useIndexData, useIndexLoad, useIndexRestore } from '../utils';
import { useOptimizedScroll } from '@/app/composables/useOptimizedScroll';
//itemtab由AppDesktop提供
// 定义组件名称
defineOptions({
  name: 'IndexPagePc'
});

// 使用 Composables
const {
  itemType: localItemType,
  articleSortMethod,
  selectedSectionId,
  ifMounted,
  lastPageNum,
  ifMobile,
  themeColor,
} = useIndexState();

// 从 AppDesktop 注入的 itemType（用于导航栏同步）
const indexItemType = inject('indexItemType', null);

// 使用注入的 itemType 或本地 itemType
const itemType = indexItemType || localItemType;

// 同步 itemType：当导航栏的 itemType 变化时，更新本地状态
if (indexItemType) {
  watch(indexItemType, (newVal) => {
    if (localItemType.value !== newVal) {
      localItemType.value = newVal;
    }
  });
  
  // 同步本地 itemType 到导航栏
  watch(localItemType, (newVal) => {
    if (indexItemType.value !== newVal) {
      indexItemType.value = newVal;
    }
  });
}

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
      if (postList.value.length === 0) {
        handleLoadMore('post');
      }
      // 同时加载板块列表
      if (sectionList.value.length === 0) {
        handleLoadMore('section');
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

// 滚动加载（使用优化的滚动监听）
// 使用优化的滚动监听替代原来的滚动事件
useOptimizedScroll({
  onReachBottom: () => {
    // 防止在其他加载未完成时加载
    if (!canLoadMore()) {
      return;
    }
    handleLoadMore(itemType.value);
  },
  containerSelector: '#router-view-container',
  threshold: 200,
  throttleDelay: 100,
});

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
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
    // 如果是帖子页面，同时加载板块数据
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    
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
    // 如果是帖子页面，同时加载板块数据
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    restoreComplete.value = true;
  }
  
  ifMounted.value = true;
  
  // 滚动监听已由 useOptimizedScroll 处理，这里不再需要手动添加
});

// 卸载时清理（useOptimizedScroll 会自动清理）
onUnmounted(() => {
  // 清理工作已由 useOptimizedScroll 处理
});

const handleViewAllSections = () => {
  openPage('router', { name: 'SectionSetPage' });
};
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

  /* 帖子页面两列布局 */
  .post-layout-container {
    display: flex;
    flex-direction: row;
    width: 1200px;
    max-width: 1200px;
    gap: 0;
    margin: 0 auto;
    padding: 0 16px;
  }

  .post-list-column {
    flex: 1;
    min-width: 0; /* 允许 flex 子元素收缩 */
  }

  .post-section-divider {
    width: 1px;
    background-color: #e0e0e0;
    flex-shrink: 0;
  }

  .section-list-column {
    width: 300px;
    flex-shrink: 0;
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    position: sticky;
    max-height: calc(100vh - 80px);
  }

  .section-list-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    flex-direction: row;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .section-list-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  /* 右侧栏中的 SectionList 样式调整 */
  .section-list-column .item-container {
    width: 100%;
    margin-bottom: 0;
  }

  /* 右侧栏中的板块卡片调整为单列显示，保持原有卡片样式 */
  .section-list-column :deep(.section-card) {
    width: 100% !important;
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

  .post-section-divider {
    display: none;
  }
}
</style>

