<template>
  <div class="posts-list-container">
    <div class="column-div">
      <template v-if="postItems.length > 0">
        <!-- 虚拟滚动：当列表项超过阈值时启用 -->
        <template v-if="shouldUseVirtualScroll">
          <!-- 顶部占位 -->
          <div :style="{ height: `${topSpacerHeight}px` }"></div>
          <!-- 可见项 -->
          <post-item
            v-for="item in visibleItems"
            :key="item.id"
            :init-data="item"
            :if-parent-author="ifParentAuthor"
            @alert="$emit('alert', $event)"
            @set_post_top="$emit('set-post-top', $event)"
          />
          <!-- 底部占位 -->
          <div :style="{ height: `${bottomSpacerHeight}px` }"></div>
        </template>
        <!-- 普通渲染：列表项较少时 -->
        <template v-else>
          <post-item
            v-for="item in postItems"
            :key="item.id"
            :init-data="item"
            :if-parent-author="ifParentAuthor"
            @alert="$emit('alert', $event)"
            @set_post_top="$emit('set-post-top', $event)"
          />
        </template>
      </template>
      <v-btn
        v-if="!allLoad"
        @click="$emit('load-more')"
        :loading="loading"
        :disabled="loading"
        variant="text"
        class="load-btn"
        :color="themeColor"
      >
        加载更多
      </v-btn>
      <nothing-view
        v-if="!loading && postItems.length == 0"
        icon="mdi-forum-outline"
        text="暂无帖子"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PostItem from '@/components/post/PostItem';
import NothingView from '@/components/common/NothingView.vue';
import { useVirtualScroll } from '@/app/composables/useVirtualScroll';

const props = defineProps({
  postItems: {
    type: Array,
    required: true,
  },
  ifParentAuthor: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  allLoad: {
    type: Boolean,
    default: false,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['load-more', 'alert', 'set-post-top']);

// 虚拟滚动阈值：当列表项超过50个时启用虚拟滚动
const VIRTUAL_SCROLL_THRESHOLD = 50;
const shouldUseVirtualScroll = computed(() => props.postItems.length > VIRTUAL_SCROLL_THRESHOLD);

// 虚拟滚动配置（帖子项预估高度约200px）
// 增大缓冲区，确保快速滚动时也能正常显示
const virtualScrollConfig = computed(() => ({
  itemHeight: 200,
  bufferSize: 20, // 缓冲区大小
  maxRenderItems: shouldUseVirtualScroll.value ? 200 : Infinity,
  containerSelector: '#router-view-container',
}));

// 使用虚拟滚动（自动根据列表长度决定是否启用）
const virtualScrollResult = useVirtualScroll(
  computed(() => props.postItems),
  virtualScrollConfig
);

const visibleItems = computed(() => virtualScrollResult.visibleItems.value);
const topSpacerHeight = computed(() => virtualScrollResult.topSpacerHeight.value);
const bottomSpacerHeight = computed(() => virtualScrollResult.bottomSpacerHeight.value);
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.load-btn {
  width: 100%;
  margin-top: 10px;
}

@media screen and (min-width: 1000px) {
  .posts-list-container {
    width: 750px;
    padding: 0;
  }
}

@media screen and (max-width: 1000px) {
  .posts-list-container {
    width: 100vw;
    padding: 0;
  }
}
</style>

