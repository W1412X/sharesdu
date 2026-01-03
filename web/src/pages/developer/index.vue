<template>
  <div class="developer-page-container">
    <!-- PC端：左右分栏布局 -->
    <div v-if="!ifMobile" class="pc-layout">
      <!-- 左侧：目录导航 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">开发者文档</h2>
        </div>
        <div class="sidebar-content">
          <div v-if="categoryLoading" class="loading-sidebar">
            <v-progress-circular indeterminate :color="themeColor" size="24"></v-progress-circular>
            <span class="loading-text">加载目录中...</span>
          </div>
          <v-list density="compact" nav v-else>
            <tree-item
              v-for="(item, index) in categoryList"
              :key="index"
              :item="item"
              :level="0"
              :active-key="currentDoc"
              :expanded-keys="expandedKeys"
              @click="handleItemClick"
              @toggle="handleToggle"
            />
          </v-list>
        </div>
      </div>
      
      <!-- 右侧：文档内容 -->
      <div class="content-area">
        <!-- PC端：返回按钮 -->
        <div class="pc-back-button-container">
          <v-btn
            @click="handleBackToWelcome"
            :color="themeColor"
            variant="text"
            prepend-icon="mdi-home"
            class="back-button"
          >
            返回首页
          </v-btn>
        </div>
        <div class="content-wrapper">
          <welcome-view 
            v-if="!currentDoc" 
            :theme-color="themeColor"
          />
          <template v-else>
            <transition name="fade" mode="out-in">
              <article-display 
                v-if="loadState" 
                :key="currentDoc"
                :initData="data" 
              />
              <div v-else :key="`loading-${currentDoc}`" class="loading-container">
                <v-progress-circular indeterminate :color="themeColor"></v-progress-circular>
                <p class="loading-text">正在加载文档...</p>
              </div>
            </transition>
            <doc-navigation
              v-if="loadState && (prevDoc || nextDoc)"
              :prev-doc="prevDoc"
              :next-doc="nextDoc"
              :theme-color="themeColor"
              @navigate="loadDocument"
            />
          </template>
        </div>
      </div>
    </div>
    
    <!-- 移动端：上下布局 -->
    <div v-else class="mobile-layout">
      <!-- 移动端侧边栏 -->
      <v-navigation-drawer
        v-model="mobileDrawerOpen"
        location="left"
        temporary
        :width="280"
        class="mobile-drawer"
      >
        <div class="mobile-drawer-header">
          <h2 class="mobile-drawer-title">开发者文档</h2>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="mobileDrawerOpen = false"
            class="mobile-drawer-close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="mobile-drawer-content">
          <div v-if="categoryLoading" class="loading-sidebar">
            <v-progress-circular indeterminate :color="themeColor" size="24"></v-progress-circular>
            <span class="loading-text">加载目录中...</span>
          </div>
          <v-list density="compact" nav v-else>
            <tree-item
              v-for="(item, index) in categoryList"
              :key="index"
              :item="item"
              :level="0"
              :active-key="currentDoc"
              :expanded-keys="expandedKeys"
              @click="handleItemClick"
              @toggle="handleToggle"
            />
          </v-list>
        </div>
      </v-navigation-drawer>
      
      <!-- 顶部：返回按钮和目录按钮 -->
      <div class="mobile-header">
        <div class="mobile-header-top">
          <v-btn
            @click="handleBackToWelcome"
            :color="themeColor"
            variant="text"
            icon="mdi-home"
            size="small"
            class="mobile-back-button"
          ></v-btn>
          <v-btn
            @click="mobileDrawerOpen = true"
            :color="themeColor"
            variant="text"
            icon="mdi-menu"
            size="small"
            class="mobile-menu-button"
          ></v-btn>
          <div class="mobile-title">开发者文档</div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="mobile-content">
        <div class="content-wrapper">
          <welcome-view 
            v-if="!currentDoc" 
            :theme-color="themeColor"
          />
          <template v-else>
            <transition name="fade" mode="out-in">
              <article-display 
                v-if="loadState" 
                :key="currentDoc"
                :initData="data" 
              />
              <div v-else :key="`loading-${currentDoc}`" class="loading-container">
                <v-progress-circular indeterminate :color="themeColor"></v-progress-circular>
                <p class="loading-text">正在加载文档...</p>
              </div>
            </transition>
            <doc-navigation
              v-if="loadState && (prevDoc || nextDoc)"
              :prev-doc="prevDoc"
              :next-doc="nextDoc"
              :theme-color="themeColor"
              @navigate="loadDocument"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { openPage } from '@/utils/other';
import ArticleDisplay from '@/components/article/ArticleDisplay.vue';
import { TreeItem, DocNavigation, WelcomeView } from './components';
import {
  useDeveloperState,
  useDeveloperData,
  useDeveloperActions,
} from './utils';

defineOptions({
  name: 'DeveloperPage',
});

// 使用 Composables
const {
  ifMobile,
  themeColor,
  currentDoc,
  expandedKeys,
  loadState,
  mobileDrawerOpen,
} = useDeveloperState();

const {
  categoryList,
  categoryLoading,
  data,
  getAdjacentDocs,
  isLoading,
} = useDeveloperData();

// 计算上一个和下一个文档
const adjacentDocs = computed(() => {
  return getAdjacentDocs(currentDoc.value);
});

const prevDoc = computed(() => adjacentDocs.value.prevDoc);
const nextDoc = computed(() => adjacentDocs.value.nextDoc);

const {
  loadCategory,
  loadDocument,
  handleItemClick: baseHandleItemClick,
  handleToggle,
} = useDeveloperActions(
  categoryList,
  categoryLoading,
  currentDoc,
  expandedKeys,
  loadState,
  data,
  isLoading
);

// 包装handleItemClick，移动端点击后关闭侧边栏
const handleItemClick = (item) => {
  baseHandleItemClick(item);
  // 移动端点击后关闭侧边栏
  if (ifMobile.value && item.file) {
    mobileDrawerOpen.value = false;
  }
};

// 返回 Welcome 页面
const handleBackToWelcome = () => {
  openPage('router', { name: 'WelcomePage' });
};

// 初始化
onMounted(async () => {
  // 加载目录配置
  await loadCategory();
  
  const route = useRoute();
  const docParam = route.query.doc;
  
  // 如果有查询参数，加载指定文档；否则显示欢迎视图
  if (docParam) {
    loadDocument(docParam);
  }
  // 如果没有查询参数，不加载任何文档，显示欢迎视图（currentDoc 保持为空）
  
  // 设置页面标题
  if (document.getElementById('web-title')) {
    document.getElementById('web-title').innerText = '开发者文档';
  }
});
</script>

<style scoped>
.developer-page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* ========== PC端布局 ========== */
.pc-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  min-width: 280px;
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.loading-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #718096;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f5f5;
  position: relative;
}

.pc-back-button-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.back-button {
  text-transform: none;
  font-weight: 500;
}

.content-wrapper {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
}

.loading-text {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

/* ========== 移动端布局 ========== */
.mobile-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mobile-header {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.mobile-header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-back-button,
.mobile-menu-button {
  flex-shrink: 0;
}

.mobile-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  text-align: center;
  padding: 0 12px;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
}

.mobile-content .content-wrapper {
  width: 100%;
  max-width: 100%;
}

/* ========== 移动端侧边栏 ========== */
.mobile-drawer {
  z-index: 1000;
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.mobile-drawer-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-drawer-close-btn {
  flex-shrink: 0;
}

.mobile-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* ========== 响应式调整 ========== */
@media screen and (min-width: 1000px) {
  .content-area {
    padding: 60px 40px;
  }
  
  .sidebar {
    width: 300px;
    min-width: 300px;
  }
}

@media screen and (max-width: 1000px) {
  .pc-layout {
    display: none;
  }
  
  .mobile-layout {
    display: flex;
  }
}

@media screen and (min-width: 1000px) {
  .mobile-layout {
    display: none;
  }
}

/* ========== 过渡动画 ========== */
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

