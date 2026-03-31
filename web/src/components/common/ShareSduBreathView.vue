<template>
  <div
    class="share-sdu-breath-view"
    :class="{ 'share-sdu-breath-view--compact': compact }"
    :style="wrapperStyle"
  >
    <div class="share-sdu-breath-view__brand" :style="brandStyle">ShareSDU</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { globalProperties } from '@/main';
import { hexToRgba } from '@/utils/other';

const props = defineProps({
  themeColor: {
    type: String,
    default: null,
  },
  minHeight: {
    type: [String, Number],
    default: null,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const resolvedThemeColor = computed(() => props.themeColor || globalProperties.$themeColor || '#8a8a8a');

const wrapperStyle = computed(() => {
  if (props.minHeight == null) {
    return null;
  }
  return {
    minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
  };
});

const brandStyle = computed(() => {
  const c = resolvedThemeColor.value;
  return {
    backgroundImage: `linear-gradient(105deg, ${hexToRgba(c, 0.04)} 0%, ${hexToRgba(c, 0.18)} 35%, ${hexToRgba(c, 0.48)} 50%, ${hexToRgba(c, 0.18)} 65%, ${hexToRgba(c, 0.04)} 100%)`,
    backgroundSize: '200% 100%',
  };
});

</script>

<style scoped>
.share-sdu-breath-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
}

.share-sdu-breath-view__brand {
  position: relative;
  font-size: clamp(24px, 9vw, 54px);
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.1;
  white-space: nowrap;
  padding: 0 2px;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: bip-ghost-sweep 3.2s ease-in-out infinite;
}

.share-sdu-breath-view--compact .share-sdu-breath-view__brand {
  font-size: clamp(18px, 6vw, 24px);
  letter-spacing: 0.08em;
}

@keyframes bip-ghost-sweep {
  0%,
  100% {
    background-position: 120% 50%;
    opacity: 0.74;
  }
  50% {
    background-position: -20% 50%;
    opacity: 1;
  }
}

@media screen and (max-width: 1000px) {
  .share-sdu-breath-view__brand {
    font-size: clamp(20px, 8vw, 42px);
  }
}
</style>
