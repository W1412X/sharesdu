<template>
  <transition name="submit-loading-fade" appear>
    <div v-if="state" class="submit-loading-view">
      <v-card
        class="submit-loading-view__card"
        color="white"
        elevation="8"
        rounded="lg"
      >
        <v-card-text class="submit-loading-view__inner">
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
          <p class="submit-loading-view__text">{{ loadText }}</p>
        </v-card-text>
      </v-card>
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
        text: '加载中...',
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
    loadText() {
      const t = this.initData?.text;
      if (t != null && String(t).trim() !== '') {
        return String(t);
      }
      return '加载中...';
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
  padding: 12px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.4);
}

.submit-loading-view__card {
  width: min(100vw - 24px, 280px);
  max-width: 100%;
}

.submit-loading-view__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 10px 10px !important;
}

.submit-loading-view__breath {
  width: 100%;
  min-height: 88px;
}

.submit-loading-view__progress {
  width: min(180px, calc(100% - 8px));
  margin-top: 6px;
  align-self: center;
}

.submit-loading-view__text {
  margin: 6px 0 0;
  padding: 0 2px;
  width: 100%;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 1.35;
  text-align: center;
  color: #616161;
  word-break: break-word;
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
    padding: 10px;
  }

  .submit-loading-view__breath {
    min-height: 80px;
  }

  .submit-loading-view__inner {
    padding: 6px 8px 8px !important;
  }

  .submit-loading-view__text {
    font-size: 11px;
    margin-top: 4px;
  }
}
</style>
