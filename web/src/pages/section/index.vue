<template>
  <div class="full-center">
    <div class="column-div">
      <!-- 板块头部 -->
      <SectionHeader
        :section="section"
        :if-master="ifMaster"
        :loading="loading"
        :load-state="loadState"
        :theme-color="themeColor"
        @set-section-top="handleSetSectionTop"
      />
      
      <!-- PC端：帖子列表和操作栏并列 -->
      <div class="content-wrapper">
        <!-- 帖子列表（支持下拉刷新） -->
        <v-pull-to-refresh 
          id="post-list-container" 
          :pull-down-threshold="64" 
          @load="handleRefresh" 
          style="flex: 1;"
        >
          <PostList
            :post-items="postItems"
            :if-parent-author="userId === section.authorId"
            :loading="loading.post"
            :all-load="allLoad.post"
            :theme-color="themeColor"
            @load-more="handleLoadMorePost"
            @alert="handleAlert"
            @set-post-top="handleSetPostTop"
          />
        </v-pull-to-refresh>
        
        <!-- PC端分割线 -->
        <div class="content-divider"></div>
        
        <!-- PC端操作栏（侧边栏） -->
        <div class="section-actions-sidebar">
          <SectionActions
            :section="section"
            :user-id="userId"
            :user-name="userName"
            :if-master="ifMaster"
            mode="sidebar"
            @edit="handleEdit"
            @publish-post="handlePublishPost"
            @delete="handleDelete"
            @alert="handleAlert"
            @set-loading="handleSetLoading"
          />
        </div>
      </div>
    </div>
  </div>
  
  <!-- 移动端：底部操作栏 -->
  <div class="section-actions-bottom">
    <SectionActions
      :section="section"
      :user-id="userId"
      :user-name="userName"
      :if-master="ifMaster"
      mode="bottom"
      @edit="handleEdit"
      @publish-post="handlePublishPost"
      @delete="handleDelete"
      @alert="handleAlert"
      @set-loading="handleSetLoading"
    />
  </div>
  
  <!-- 帖子编辑器对话框 -->
  <PostEditorDialog
    v-model:if-show="ifShowPostEditor"
    :section-id="section.id"
    @close="handleCloseEditor"
    @add-post="handleAddPost"
    @set-loading="handleSetLoading"
    @alert="handleAlert"
  />
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, openPage } from '@/utils/other';
import { setArticleTop } from '@/api/modules/top';
import { usePostPolling } from '@/app/composables';
import { getPostListByArticleId } from '@/api/modules/article';
import {
  SectionHeader,
  SectionActions,
  PostEditorDialog,
  PostList,
} from './components';
import {
  useSectionState,
  useSectionData,
  useSectionLoad,
} from './utils';
import { moreOptionEventBus } from '@/utils/eventBus';

// 定义组件名称
defineOptions({
  name: 'SectionPage',
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
  ifShowPostEditor,
  loadState,
  setPostEditorState,
} = useSectionState();

const {
  section,
  sectionResponse,
  postItems,
  postPageNum,
  loading,
  allLoad,
  setSection,
  addPost,
  addPosts,
  setPosts,
  setPostTop,
  resetPosts,
} = useSectionData();

// 加载逻辑
const { loadSection, loadMorePost, refreshPost } = useSectionLoad(
  section,
  sectionResponse,
  postItems,
  postPageNum,
  allLoad,
  loading,
  setSection,
  addPosts,
  setPosts,
  (msg) => emit('alert', msg)
);

// 板块ID
const sectionId = computed(() => route.params.id || '');

// 处理提示
const handleAlert = (msg) => {
  emit('alert', msg);
};

// 处理加载状态
const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 处理设置板块置顶
const handleSetSectionTop = async () => {
  if (!ifMaster) {
    emit('alert', getNormalErrorAlert('您不是管理员，无法执行此操作'));
    return;
  }
  
  loading.value.top = true;
  try {
    const response = await setArticleTop(section.value.id, !section.value.ifTop);
    if (response.status === 200) {
      section.value.ifTop = !section.value.ifTop;
      emit('alert', getNormalSuccessAlert(section.value.ifTop ? '置顶成功' : '取消置顶成功'));
    } else {
      emit('alert', getNormalErrorAlert(response.message));
    }
  } catch (error) {
    emit('alert', getNormalErrorAlert(error.message || '操作失败'));
  } finally {
    loading.value.top = false;
  }
};

// 处理编辑板块
const handleEdit = () => {
  openPage('router', {
    name: 'SectionEditorPage',
    params: { id: section.value.id },
  });
};

// 处理发布帖子
const handlePublishPost = () => {
  setPostEditorState(true);
};

// 处理删除板块
const handleDelete = () => {
  openPage('router', {
    name: 'IndexPage',
  });
};

// 处理关闭编辑器
const handleCloseEditor = () => {
  setPostEditorState(false);
};

// 处理添加帖子
const handleAddPost = (post) => {
  addPost(post);
  setPostEditorState(false);
};

// 处理刷新
const handleRefresh = async ({ done }) => {
  await refreshPost(sectionId.value);
  
  // 如果是帖子列表，重置轮询基准
  if (postPollingController) {
    postPollingController.resetBaseline();
  }
  
  done('ok');
};

// 处理加载更多帖子
const handleLoadMorePost = () => {
  loadMorePost(sectionId.value);
};

// 处理设置帖子置顶
const handleSetPostTop = (msg) => {
  setPostTop(msg);
};

// 帖子轮询控制器
let postPollingController = null;

// 初始化帖子轮询
const initPostPolling = () => {
  
  // 如果轮询控制器已存在，先停止
  if (postPollingController) {
    postPollingController.stopPolling();
  }
  
  // 创建获取帖子列表的函数
  const fetchPostList = async (pageIndex, useCache) => {
    return await getPostListByArticleId(sectionId.value, pageIndex, useCache);
  };
  
  // 创建获取当前帖子列表的函数
  const getPostList = () => {
    return postItems.value;
  };
  
  // 创建设置帖子列表的函数（在列表顶部插入新帖子）
  const setPostList = (newPosts) => {
    postItems.value.unshift(...newPosts);
  };
  
  // 创建 alert 函数
  const alertFn = (msg) => {
    handleAlert(msg);
  };
  
  // 初始化轮询
  postPollingController = usePostPolling(
    fetchPostList,
    getPostList,
    setPostList,
    alertFn,
    { interval: 60000 } // 1 分钟
  );
  
  
  // 启动轮询
  postPollingController.startPolling();
};

// 监听路由变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      // 停止旧的轮询
      if (postPollingController) {
        postPollingController.stopPolling();
      }
      
      resetPosts();
      loadState.value = false;
      handleSetLoading(getLoadMsg('正在加载板块...'));
      const result = await loadSection(newId);
      if (result.success) {
        loadState.value = true;
        // 初始加载帖子列表
        await loadMorePost(newId);
        
        // 重新初始化轮询（使用新的 sectionId）
        initPostPolling();
      }
      handleSetLoading(getCancelLoadMsg());
    }
  },
  { immediate: true }
);

// 初始化页面
const initPage = async () => {
  handleSetLoading(getLoadMsg('正在加载板块...'));
  let result=await loadSection(sectionId.value);
  if (result.success) {
    loadState.value = true;
    // 初始加载帖子列表（等待完成）
    await loadMorePost(sectionId.value);
  }
  handleSetLoading(getCancelLoadMsg());
};
// 组件挂载
onMounted(async() => {
  await initPage();
  moreOptionEventBus.emit("section",section.value);
  // 初始化帖子轮询（在帖子列表加载完成后）
  initPostPolling();
});

// 组件卸载前停止轮询
onBeforeUnmount(() => {
  if (postPollingController) {
    postPollingController.stopPolling();
  }
});
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: stretch;
  position: relative;
  min-height: 80vh;
}

.content-divider {
  width: 1px;
  background-color: #e0e0e0;
  flex-shrink: 0;
}

.section-actions-sidebar {
  flex-shrink: 0;
}

.section-actions-bottom {
  width: 100%;
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
  
  .column-div {
    padding-bottom: 0;
  }
  
  .section-actions-bottom {
    display: none;
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
  
  .column-div {
    padding-bottom: 50px; /* 为底部操作栏留出空间 */
  }
  
  .content-wrapper {
    flex-direction: column;
  }
  
  .content-divider {
    display: none;
  }
  
  .section-actions-sidebar {
    display: none;
  }
}
</style>

