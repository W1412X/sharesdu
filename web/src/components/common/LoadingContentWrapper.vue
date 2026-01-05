<template>
  <transition name="loading-content-fade" mode="out-in">
    <!-- 加载视图 -->
    <div v-if="!loadState" key="loading" class="loading-container" :class="attrs.class">
      <part-loading-view :state="true" :text="loadingText"></part-loading-view>
    </div>
    <!-- 内容视图 -->
    <div v-else key="content" class="content-container" :class="attrs.class">
      <slot></slot>
    </div>
  </transition>
</template>

<script setup>
import { useAttrs } from 'vue';
import PartLoadingView from './PartLoadingView.vue';

defineProps({
  loadState: {
    type: Boolean,
    required: true,
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
});

const attrs = useAttrs();
</script>

<style scoped>
.loading-container,
.content-container {
  width: 100%;
  height: 100%;
}

/* 加载-内容切换过渡动画 */
.loading-content-fade-enter-active {
  transition: opacity 0.2s ease-in;
}

.loading-content-fade-leave-active {
  transition: opacity 0.15s ease-out;
}

.loading-content-fade-enter-from,
.loading-content-fade-leave-to {
  opacity: 0;
}

.loading-content-fade-enter-to,
.loading-content-fade-leave-from {
  opacity: 1;
}
</style>

