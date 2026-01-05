<template>
  <transition :name="transitionName" :mode="mode" appear>
    <div v-if="show" :key="transitionKey" class="transition-wrapper">
      <slot></slot>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  transitionName: {
    type: String,
    default: 'fade',
  },
  mode: {
    type: String,
    default: 'out-in',
    validator: (value) => ['out-in', 'in-out', 'default'].includes(value),
  },
  transitionKey: {
    type: [String, Number],
    default: undefined,
  },
});
</script>

<style scoped>
.transition-wrapper {
  width: 100%;
  height: 100%;
}

/* 淡入淡出过渡 */
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

/* 滑动淡入过渡 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* 缩放淡入过渡 */
.scale-fade-enter-active {
  transition: all 0.3s ease-out;
}

.scale-fade-leave-active {
  transition: all 0.2s ease-in;
}

.scale-fade-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.scale-fade-enter-to,
.scale-fade-leave-from {
  transform: scale(1);
  opacity: 1;
}
</style>

