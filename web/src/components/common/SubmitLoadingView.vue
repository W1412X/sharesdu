<template>
  <transition name="submit-loading-fade" appear>
    <div v-if="state" class="submit-loading-view">
      <share-sdu-breath-view
        class="submit-loading-view__breath"
        compact
      ></share-sdu-breath-view>
      <v-progress-linear
        v-if="progress >= 0"
        class="submit-loading-view__progress"
        :model-value="progress"
        color="grey-lighten-1"
        height="4"
        rounded
      ></v-progress-linear>
    </div>
  </transition>
</template>

<script>
import ShareSduBreathView from './ShareSduBreathView.vue';

export default {
  name: 'SubmitLoadingView',
  components: {
    ShareSduBreathView,
  },
  props: {
    initData: {
      type: Object,
      default: () => ({
        state: false,
        progress: -1,
      }),
    },
  },
  computed: {
    state() {
      return !!this.initData?.state;
    },
    progress() {
      return typeof this.initData?.progress === 'number' ? this.initData.progress : -1;
    },
  },
};
</script>

<style scoped>
.submit-loading-view {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: transparent;
}

.submit-loading-view__breath {
  width: min(100vw, 420px);
  min-height: 180px;
}

.submit-loading-view__progress {
  width: min(240px, calc(100vw - 64px));
  margin-top: 16px;
}

.submit-loading-fade-enter-active,
.submit-loading-fade-leave-active {
  transition: opacity 0.18s ease;
}

.submit-loading-fade-enter-from,
.submit-loading-fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 1000px) {
  .submit-loading-view {
    padding: 14px;
  }

  .submit-loading-view__breath {
    min-height: 160px;
  }
}
</style>
