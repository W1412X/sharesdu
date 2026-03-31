<template>
  <div
    class="loading-content-wrapper"
    :class="[`loading-content-wrapper--${variant}`, { 'is-loading': !resolvedLoadState }]"
    :style="wrapperStyle"
    v-bind="attrs"
  >
    <transition name="loading-skeleton-fade" mode="out-in">
      <div v-if="showSkeleton" key="skeleton" class="loading-content-wrapper__skeleton">
        <loading-skeleton
          :variant="variant"
          :item-count="itemCount"
          :meta-count="metaCount"
          :chip-count="chipCount"
          :dense="dense"
        ></loading-skeleton>
      </div>
      <div v-else key="content" class="loading-content-wrapper__content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import LoadingSkeleton from './LoadingSkeleton.vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  loadState: {
    type: Boolean,
    required: true,
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  variant: {
    type: String,
    default: 'card',
  },
  minHeight: {
    type: [String, Number],
    default: null,
  },
  delay: {
    type: Number,
    default: 0,
  },
  itemCount: {
    type: Number,
    default: 3,
  },
  metaCount: {
    type: Number,
    default: 3,
  },
  chipCount: {
    type: Number,
    default: 3,
  },
  dense: {
    type: Boolean,
    default: false,
  },
});

const attrs = useAttrs();
const showSkeleton = ref(false);
let timer = null;

const resolvedLoadState = computed(() => !!props.loadState);

const wrapperStyle = computed(() => {
  if (props.minHeight == null) {
    return null;
  }

  return {
    minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
  };
});

watch(
  () => props.loadState,
  (value) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (value) {
      showSkeleton.value = false;
      return;
    }

    if (props.delay <= 0) {
      showSkeleton.value = true;
      return;
    }

    timer = window.setTimeout(() => {
      showSkeleton.value = true;
    }, props.delay);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.loading-content-wrapper {
  position: relative;
  width: 100%;
}

.loading-content-wrapper__content {
  width: 100%;
}

.loading-content-wrapper__skeleton {
  width: 100%;
  pointer-events: none;
}

.loading-skeleton-fade-enter-active,
.loading-skeleton-fade-leave-active {
  transition: opacity 0.18s ease;
}

.loading-skeleton-fade-enter-from,
.loading-skeleton-fade-leave-to {
  opacity: 0;
}
</style>
