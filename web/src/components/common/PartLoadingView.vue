<template>
  <transition name="part-loading-fade" appear>
    <div v-if="state" class="part-loading-view" :class="[`part-loading-view--${variant}`]">
      <loading-skeleton
        :variant="variant"
        :item-count="itemCount"
        :meta-count="metaCount"
        :chip-count="chipCount"
        :dense="dense"
      ></loading-skeleton>
    </div>
  </transition>
</template>

<script>
import LoadingSkeleton from './LoadingSkeleton.vue';

export default {
  name: 'PartLoadingView',
  components: {
    LoadingSkeleton,
  },
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '加载中...',
    },
    variant: {
      type: String,
      default: 'card',
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
  },
};
</script>

<style scoped>
.part-loading-view {
  width: 100%;
  min-height: 200px;
}

.part-loading-view--list {
  min-height: 240px;
}

.part-loading-fade-enter-active,
.part-loading-fade-leave-active {
  transition: opacity 0.18s ease;
}

.part-loading-fade-enter-from,
.part-loading-fade-leave-to {
  opacity: 0;
}
</style>
