<template>
  <div class="full-center">
    <div id="search-part-container" class="column-div">
      <!-- 控制栏：搜索类型和排序 -->
      <div class="control-bar">
        <SearchTypeSelector
          v-model="searchType"
          @update:model-value="handleSearchTypeChange"
        />
        <v-spacer></v-spacer>
        <SortTypeSelector
          v-if="searchType !== '全部' && searchType !== '回复' && searchType !== '微服务'"
          :sort-type="sortType"
          :sort-icon-now="sortIconNow"
          :sort-type-label-now="sortTypeLabelNow"
          :sort-options-to-show="sortOptionsToShow"
          :theme-color="themeColor"
          @update:sort-type="handleSortTypeChange"
        />
      </div>
      
      <!-- 控制栏：筛选和结果数量 -->
      <div class="control-bar">
        <CourseFilter
          :search-type="searchType"
          v-model:if-course-filter="ifCourseFilter"
          v-model:course-college="courseCollege"
          v-model:course-type="courseType"
          v-model:course-method="courseMethod"
          :colleges="colleges"
          :theme-color="themeColor"
          @update:course-college="handleCourseFilterChange"
          @update:course-type="handleCourseFilterChange"
          @update:course-method="handleCourseFilterChange"
        />
        <ArticleFilter
          :search-type="searchType"
          v-model:if-article-filter="ifArticleFilter"
          :filt-article-tags="filtArticleTags"
          v-model:editing-article-filt-tag="editingArticleFiltTag"
          :theme-color="themeColor"
          @add-tag="handleAddArticleTag"
          @delete-tag="handleDeleteArticleTag"
          @alert="handleAlert"
        />
        <v-spacer v-if="searchType !== '课程' && searchType !== '文章'"></v-spacer>
        <div class="text-small-bold" style="color: grey;">
          共
          <span :style="{ color: themeColor }">
            {{ searchResultNum[searchType][sortType] }}
          </span>
          条结果
        </div>
      </div>
      
      <!-- 搜索结果列表 -->
      <SearchResultList
        :search-type="searchType"
        :search-list="currentSearchList"
        :loading="loading.item"
        :all-load="allLoad[searchType][sortType]"
        :un-found-text="unFoundText"
        :query="query"
        :theme-color="themeColor"
        @load-more="handleLoadMore"
      />
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { isElementAtBottom } from '@/utils/other';
import { addToSearchHistory } from '@/components/common/searchInput/js/utils';
import { openPage } from '@/utils/other';
import {
  SearchTypeSelector,
  SortTypeSelector,
  CourseFilter,
  ArticleFilter,
  SearchResultList,
} from './components';
import {
  useSearchState,
  useSearchData,
  useSearchLoad,
  useSearchRestore,
  SORT_OPTIONS,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'SearchPage',
});

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'all',
  },
  sort: {
    type: String,
    default: null,
  },
  query: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['alert', 'search_type_changed']);

// 使用 Composables
const {
  searchType,
  sortType,
  ifMounted,
  courseCollege,
  courseMethod,
  courseType,
  ifCourseFilter,
  filtArticleTags,
  editingArticleFiltTag,
  ifArticleFilter,
  articleType,
  themeColor,
  colleges,
  queryToSubmit,
  filtArticleTagsToSubmit,
  sortIconNow,
  sortTypeLabelNow,
  unFoundText,
  sortOptionsToShow,
  setSortType,
  addArticleTag,
  deleteArticleTag,
  getCourseTypeForAPI,
  getCourseMethodForAPI,
  getCourseCollegeForAPI,
} = useSearchState(props);

const {
  searchList,
  searchPage,
  allLoad,
  searchResultNum,
  loading,
  resetResults,
  setArticleResults,
  addArticleResults,
  setPostResults,
  addPostResults,
  setCourseResults,
  addCourseResults,
  setReplyResults,
  addReplyResults,
  setGlobalResults,
  addGlobalResults,
  setMicroserviceResults,
  addMicroserviceResults,
} = useSearchData();

// 页面恢复机制
const {
  isRestoring,
  restoreComplete,
  restoreState,
  saveState,
  shouldRestore,
  getTargetPageNum,
} = useSearchRestore(computed(() => props.query));

// 加载逻辑
// eslint-disable-next-line no-unused-vars
const { load, refresh } = useSearchLoad(
  searchType,
  sortType,
  queryToSubmit,
  searchList,
  searchPage,
  allLoad,
  searchResultNum,
  loading,
  filtArticleTagsToSubmit,
  articleType,
  getCourseTypeForAPI,
  getCourseMethodForAPI,
  getCourseCollegeForAPI,
  setArticleResults,
  addArticleResults,
  setPostResults,
  addPostResults,
  setCourseResults,
  addCourseResults,
  setReplyResults,
  addReplyResults,
  setGlobalResults,
  addGlobalResults,
  setMicroserviceResults,
  addMicroserviceResults,
  (msg) => emit('alert', msg)
);

// 当前搜索结果列表
const currentSearchList = computed(() => {
  return searchList.value[searchType.value][sortType.value] || [];
});

// 处理搜索类型变化
const handleSearchTypeChange = async (newType) => {
  if (!ifMounted.value) {
    return;
  }
  
  emit('search_type_changed', newType);
  
  // 设置排序类型
  if (newType !== '全部' && newType !== '回复' && newType !== '微服务') {
    setSortType(SORT_OPTIONS[newType][0].value);
  } else {
    setSortType(null);
  }
  
  // 如果已有数据，不重新加载
  const newSortType = newType !== '全部' && newType !== '回复' && newType !== '微服务'
    ? SORT_OPTIONS[newType][0].value 
    : null;
  
  if (searchList.value[newType][newSortType].length > 0) {
    return;
  }
  
  await load(true);
};

// 处理排序类型变化
const handleSortTypeChange = async (newSortType) => {
  setSortType(newSortType);
  
  // 如果已有数据，不重新加载
  if (searchList.value[searchType.value][newSortType].length > 0) {
    return;
  }
  
  await load(true);
};

// 处理课程筛选变化
const handleCourseFilterChange = async () => {
  if (!ifMounted.value) {
    return;
  }
  resetResults('课程', sortType.value);
  await load(true);
};

// 处理添加文章标签
const handleAddArticleTag = async (tag) => {
  if (addArticleTag(tag)) {
    resetResults('文章', sortType.value);
    await load(true);
  }
};

// 处理删除文章标签
const handleDeleteArticleTag = async (tag) => {
  deleteArticleTag(tag);
  resetResults('文章', sortType.value);
  await load(true);
};

// 处理加载更多
const handleLoadMore = async () => {
  await load(false);
};

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 滚动加载
const glideLoad = () => {
  const container = document.getElementById('search-part-container');
  if (container && isElementAtBottom(container)) {
    handleLoadMore();
  }
};

// 监听课程筛选变化
watch([courseCollege, courseMethod, courseType], async () => {
  if (!ifMounted.value) {
    return;
  }
  if (searchType.value === '课程') {
    resetResults('课程', sortType.value);
    await load(true);
  }
}, { deep: true });

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
    const scrollElement = document.getElementById('router-view-container');
    const scrollTop = scrollElement?.scrollTop || 0;
    
    saveState({
      editingArticleFiltTag: editingArticleFiltTag.value,
      courseCollege: courseCollege.value,
      courseMethod: courseMethod.value,
      courseType: courseType.value,
      searchType: searchType.value,
      ifCourseFilter: ifCourseFilter.value,
      ifArticleFilter: ifArticleFilter.value,
      filtArticleTags: filtArticleTags.value,
      sortType: sortType.value,
      articleType: articleType.value,
      pageNum: searchPage.value,
      scrollTop: scrollTop,
    });
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  next();
});

// 挂载时恢复状态
onMounted(async () => {
  const webTitle = document.getElementById('web-title');
  if (webTitle) {
    webTitle.innerText = '搜索結果';
  }
  
  const restoredState = restoreState();
  
  if (shouldRestore(restoredState)) {
    // 需要恢复状态
    isRestoring.value = true;
    
    // 恢复基本状态
    searchType.value = restoredState.searchType;
    sortType.value = restoredState.sortType;
    courseCollege.value = restoredState.courseCollege;
    courseMethod.value = restoredState.courseMethod;
    courseType.value = restoredState.courseType;
    ifCourseFilter.value = restoredState.ifCourseFilter;
    ifArticleFilter.value = restoredState.ifArticleFilter;
    filtArticleTags.value = restoredState.filtArticleTags;
    editingArticleFiltTag.value = restoredState.editingArticleFiltTag;
    articleType.value = restoredState.articleType;
    
    // 先加载第一页数据（快速显示）
    await load(true);
    
    // 等待 DOM 更新
    await nextTick();
    
    // 恢复滚动位置并加载到目标页码
    const targetPageNum = getTargetPageNum(
      searchType.value,
      sortType.value,
      restoredState.pageNum,
      searchPage.value
    );
    
    // 如果目标页码大于当前页码，需要加载更多
    const currentPage = searchPage.value[searchType.value][sortType.value];
    if (targetPageNum > currentPage) {
      while (searchPage.value[searchType.value][sortType.value] < targetPageNum) {
        await load(false);
        if (allLoad.value[searchType.value][sortType.value]) {
          break;
        }
      }
    }
    
    // 等待所有数据加载完成后再恢复滚动位置
    await nextTick();
    
    // 使用 requestAnimationFrame 确保 DOM 完全渲染
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
  } else {
    // 不需要恢复，根据 props 初始化
    if (props.query.length > 0) {
      switch (props.type) {
        case 'article':
          searchType.value = '文章';
          break;
        case 'course':
          searchType.value = '课程';
          break;
        case 'post':
          searchType.value = '帖子';
          break;
        case 'reply':
          searchType.value = '回复';
          break;
        case 'all':
          searchType.value = '全部';
          break;
        default:
          searchType.value = '全部';
      }
      
      // 设置排序类型
      if (searchType.value !== '全部' && searchType.value !== '回复' && searchType.value !== '微服务') {
        setSortType(SORT_OPTIONS[searchType.value][0].value);
      } else {
        setSortType(null);
      }
      
      // 加载数据
      if (searchList.value[searchType.value][sortType.value].length === 0) {
        await load(true);
      }
    } else {
      openPage('router', {
        name: 'ErrorPage',
        params: {
          reason: '缺少必要参数 >_< ',
        },
      });
    }
    restoreComplete.value = true;
  }
  
  ifMounted.value = true;
  
  // 添加滚动监听
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.addEventListener('scroll', glideLoad);
  }
  
  // 添加搜索历史
  if (props.query && props.query.length > 0) {
    addToSearchHistory(props.query[0]);
  }
});

// 卸载时清理
onUnmounted(() => {
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.removeEventListener('scroll', glideLoad);
  }
});
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
  height: max-content;
}

.control-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: max-content;
  overflow-x: auto;
  padding: 5px;
}

/** desktop */
@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    height: 100%;
  }

  .control-bar {
    width: 750px;
    max-width: 750px;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .full-center {
    width: 100vw;
    height: 100vh;
  }

  .control-bar {
    width: 100vw;
  }
}
</style>

