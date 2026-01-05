<template>
  <div class="full-center">
    <div style="display: grid; flex-direction: column; place-items: center">
      <AuthorCardWrapper
        v-if="authorId"
        :author-id="authorId"
        :if-master="ifMaster"
        @alert="handleAlert"
        @author-name="handleAuthorName"
      />
      <v-card v-if="authorId" class="card">
        <loading-content-wrapper :load-state="loadState" loading-text="正在获取创作信息...">
          <ContentTabs v-model="itemType" @update:model-value="handleItemTypeChange" />
          <ContentList
            :item-type="itemType"
            :content-list="currentContentList"
            :display-mode="displayMode"
            :loading="currentLoading"
            :all-load="currentAllLoad"
            @load-more="handleLoadMore"
          />
        </loading-content-wrapper>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getCancelLoadMsg, getLoadMsg, openPage } from '@/utils/other';
import { AuthorCardWrapper, ContentTabs, ContentList } from './components';
import {
  useAuthorState,
  useAuthorData,
  useAuthorLoad,
} from './utils';
import LoadingContentWrapper from '@/components/common/LoadingContentWrapper.vue';

// 定义组件名称
defineOptions({
  name: 'AuthorPage',
});

// Emits
const emit = defineEmits(['set_loading', 'alert']);

// 路由
const route = useRoute();

// 状态管理
const {
  ifMaster,
  currentUserId,
  itemType,
  displayMode,
  loadState,
} = useAuthorState();

// 数据管理
const {
  authorData,
  articleList,
  postList,
  replyList,
  articlePageNum,
  postPageNum,
  replyPageNum,
  loading,
  allLoad,
  setAuthorData,
  setArticleList,
  addArticleList,
  setPostList,
  addPostList,
  setReplyList,
  addReplyList,
  getCurrentList,
} = useAuthorData();

// 作者ID
const authorId = ref(null);

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 加载逻辑
const { loadAuthorInfo, loadPreview, loadMoreContent } = useAuthorLoad(
  authorData,
  articleList,
  postList,
  replyList,
  articlePageNum,
  postPageNum,
  replyPageNum,
  allLoad,
  loading,
  setAuthorData,
  setArticleList,
  addArticleList,
  setPostList,
  addPostList,
  setReplyList,
  addReplyList,
  handleAlert
);

// 计算属性
const currentContentList = computed(() => {
  return getCurrentList(itemType.value);
});

const currentLoading = computed(() => {
  return loading.value[itemType.value];
});

const currentAllLoad = computed(() => {
  return allLoad.value[itemType.value];
});

// 处理作者名称变化
const handleAuthorName = (name) => {
  if (document.getElementById('web-title')) {
    document.getElementById('web-title').innerText = '作者 | ' + name;
  }
};

// 处理内容类型变化
const handleItemTypeChange = async (newType) => {
  // 预览模式下，数据已经在 mounted 时加载完成，不需要额外加载
  // 全部模式下，如果当前类型列表为空，加载数据
  if (displayMode.value === 'all') {
    const currentList = getCurrentList(newType);
    if (currentList.length === 0) {
      await loadMoreContent(authorId.value, newType);
    }
  }
};

// 处理加载更多
const handleLoadMore = async () => {
  if (displayMode.value === 'all') {
    await loadMoreContent(authorId.value, itemType.value);
  }
};

// 初始化页面
const initPage = async () => {
  const routeId = route.params.id;
  
  // 如果是自己的页面，跳转到 SelfPage
  if (routeId === currentUserId) {
    openPage('router', {
      name: 'SelfPage',
      params: { id: currentUserId },
    });
    return;
  }

  authorId.value = routeId;
  handleSetLoading(getLoadMsg('正在加载作者信息...'));

  // 加载作者信息
  const authorResult = await loadAuthorInfo(routeId);
  if (!authorResult.success) {
    handleSetLoading(getCancelLoadMsg());
    return;
  }

  // AuthorPage 默认使用预览模式
  // 如果需要全部模式，可以通过 props 或路由参数控制
  displayMode.value = 'preview';
  
  // 预览模式：加载预览数据
  await loadPreview(routeId);
  loadState.value = true;

  handleSetLoading(getCancelLoadMsg());
};

// 页面加载时初始化
onMounted(() => {
  initPage();
});
</script>

<style scoped>
.full-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

@media screen and (min-width: 1000px) {
  .card {
    width: 750px;
    max-height: 800px;
    height: fit-content;
    padding: 10px;
  }
}

@media screen and (max-width: 1000px) {
  .card {
    width: 100vw;
    max-height: 90vh;
    padding: 10px;
  }
}
</style>

