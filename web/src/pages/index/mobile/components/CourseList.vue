<template>
  <div class="item-container">
    <template v-if="courseList.length > 0">
      <!-- 虚拟滚动：当列表项超过阈值时启用 -->
      <template v-if="shouldUseVirtualScroll">
        <!-- 顶部占位 -->
        <div :style="{ height: `${topSpacerHeight}px` }"></div>
        <!-- 可见项 -->
        <course-item 
          v-for="item in visibleItems" 
          :key="item.id" 
          :init-data="item"
        ></course-item>
        <!-- 底部占位 -->
        <div :style="{ height: `${bottomSpacerHeight}px` }"></div>
      </template>
      <!-- 普通渲染：列表项较少时 -->
      <template v-else>
        <course-item 
          v-for="item in courseList" 
          :key="item.id" 
          :init-data="item"
        ></course-item>
      </template>
    </template>
    <LoadMoreButton
      :all-load="allLoad"
      :loading="loading"
      :theme-color="themeColor"
      @load-more="$emit('load-more')"
    />
    <nothing-view 
      v-if="!loading && courseList.length == 0" 
      icon="mdi-school-outline" 
      text="暂无课程" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadMoreButton from './LoadMoreButton.vue';
import CourseItem from '@/components/course/CourseItem';
import NothingView from '@/components/common/NothingView.vue';
import { useVirtualScroll } from '@/app/composables/useVirtualScroll';

const props = defineProps({
  courseList: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
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

defineEmits(['load-more']);

// 虚拟滚动阈值：当列表项超过50个时启用虚拟滚动
const VIRTUAL_SCROLL_THRESHOLD = 50;
const shouldUseVirtualScroll = computed(() => props.courseList.length > VIRTUAL_SCROLL_THRESHOLD);

// 虚拟滚动配置（课程项预估高度约180px）
// 增大缓冲区，确保快速滚动时也能正常显示
const virtualScrollConfig = computed(() => ({
  itemHeight: 180,
  bufferSize: 20, // 缓冲区大小
  maxRenderItems: shouldUseVirtualScroll.value ? 200 : Infinity,
  containerSelector: '#router-view-container',
}));

// 使用虚拟滚动（自动根据列表长度决定是否启用）
const virtualScrollResult = useVirtualScroll(
  computed(() => props.courseList),
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


