<template>
  <transition name="splash-fade" appear>
    <div v-if="show" class="splash-screen">
      <share-sdu-breath-view
        class="splash-screen__breath"
        :min-height="'220px'"
      />
    </div>
  </transition>
</template>

<script>
import ShareSduBreathView from './ShareSduBreathView.vue';

export default {
  name: 'SplashScreen',
  components: {
    ShareSduBreathView,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.splash-screen__breath {
  width: min(100vw, 420px);
}

.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.3s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}
</style>
