<template>
  <div class="item-container">
    <ArticleSortBar 
      :sort-method="sortMethod"
      :theme-color="themeColor"
      :if-mobile="ifMobile"
      @update:sort-method="$emit('update:sortMethod', $event)"
    />
    <template v-if="articleList.length > 0">
      <!-- 虚拟滚动：当列表项超过阈值时启用 -->
      <template v-if="shouldUseVirtualScroll">
        <!-- 顶部占位 -->
        <div :style="{ height: `${topSpacerHeight}px` }"></div>
        <!-- 可见项 -->
        <article-item 
          v-for="item in visibleItems" 
          :key="item.id" 
          :init-data="item"
        ></article-item>
        <!-- 底部占位 -->
        <div :style="{ height: `${bottomSpacerHeight}px` }"></div>
      </template>
      <!-- 普通渲染：列表项较少时 -->
      <template v-else>
        <article-item 
          v-for="item in articleList" 
          :key="item.id" 
          :init-data="item"
        ></article-item>
      </template>
    </template>
    <LoadMoreButton
      :all-load="allLoad"
      :loading="loading"
      :theme-color="themeColor"
      @load-more="$emit('load-more')"
    />
    <nothing-view 
      v-if="!loading && articleList.length == 0" 
      icon="mdi-book-open-outline" 
      text="暂无文章" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ArticleSortBar from './ArticleSortBar.vue';
import LoadMoreButton from './LoadMoreButton.vue';
import ArticleItem from '@/components/article/ArticleItem';
import NothingView from '@/components/common/NothingView.vue';
import { useVirtualScroll } from '@/app/composables/useVirtualScroll';

const props = defineProps({
  articleList: {
    type: Array,
    required: true,
  },
  sortMethod: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  ifMobile: {
    type: Boolean,
    required: true,
  },
  allLoad: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:sortMethod', 'load-more']);

// 虚拟滚动阈值：当列表项超过50个时启用虚拟滚动
const VIRTUAL_SCROLL_THRESHOLD = 50;
const shouldUseVirtualScroll = computed(() => props.articleList.length > VIRTUAL_SCROLL_THRESHOLD);

// 虚拟滚动配置（文章项预估高度约250px）
// 增大缓冲区，确保快速滚动时也能正常显示
const virtualScrollConfig = computed(() => ({
  itemHeight: 250,
  bufferSize: 20, // 缓冲区大小
  maxRenderItems: shouldUseVirtualScroll.value ? 200 : Infinity,
  containerSelector: '#router-view-container',
}));

// 使用虚拟滚动（自动根据列表长度决定是否启用）
const virtualScrollResult = useVirtualScroll(
  computed(() => props.articleList),
  virtualScrollConfig
);

const visibleItems = computed(() => virtualScrollResult.visibleItems.value);
const topSpacerHeight = computed(() => virtualScrollResult.topSpacerHeight.value);
const bottomSpacerHeight = computed(() => virtualScrollResult.bottomSpacerHeight.value);

</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    width: 750px;
    flex-direction: column;
    background-color: white;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    background-color: white;
  }
}
</style>


