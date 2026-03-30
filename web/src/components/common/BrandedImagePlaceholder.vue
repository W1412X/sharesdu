<template>
  <div class="bip" :class="rootClass">
    <div class="bip__shimmer" :style="shimmerStyle"></div>
    <div class="bip__mark">
      <span class="bip__brand bip__brand--ghost" :style="brandGhostStyle">ShareSDU</span>
      <span
        v-if="showTagline && variant === 'fullscreen'"
        class="bip__tagline bip__tagline--ghost"
        :style="taglineGhostStyle"
      >
        {{ taglineText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { hexToRgba } from '@/utils/other';

const props = defineProps({
  themeColor: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'dark'].includes(v),
  },
  variant: {
    type: String,
    default: 'embed',
    validator: (v) => ['compact', 'embed', 'fullscreen'].includes(v),
  },
  showTagline: {
    type: Boolean,
    default: false,
  },
  taglineText: {
    type: String,
    default: '加载中',
  },
});

const rootClass = computed(() => `bip--${props.variant} bip--tone-${props.tone}`);

const shimmerStyle = computed(() => {
  const c = props.themeColor;
  if (props.tone === 'dark') {
    return {
      background: `linear-gradient(110deg, ${hexToRgba(c, 0.14)} 25%, ${hexToRgba(c, 0.32)} 37%, ${hexToRgba(c, 0.14)} 63%)`,
      backgroundSize: '400% 100%',
    };
  }
  return {
    background: `linear-gradient(110deg, ${hexToRgba(c, 0.08)} 25%, ${hexToRgba(c, 0.18)} 37%, ${hexToRgba(c, 0.08)} 63%)`,
    backgroundSize: '400% 100%',
  };
});

/** 整词同色：低透明主题色 + 中间略亮，扫光若隐若现 */
const brandGhostStyle = computed(() => {
  const c = props.themeColor;
  if (props.tone === 'dark') {
    return {
      backgroundImage: `linear-gradient(105deg, ${hexToRgba(c, 0.06)} 0%, ${hexToRgba(c, 0.22)} 35%, ${hexToRgba(c, 0.55)} 50%, ${hexToRgba(c, 0.22)} 65%, ${hexToRgba(c, 0.06)} 100%)`,
      backgroundSize: '200% 100%',
    };
  }
  return {
    backgroundImage: `linear-gradient(105deg, ${hexToRgba(c, 0.04)} 0%, ${hexToRgba(c, 0.18)} 35%, ${hexToRgba(c, 0.42)} 50%, ${hexToRgba(c, 0.18)} 65%, ${hexToRgba(c, 0.04)} 100%)`,
    backgroundSize: '200% 100%',
  };
});

const taglineGhostStyle = computed(() => {
  const c = props.themeColor;
  const a = props.tone === 'dark' ? 0.28 : 0.32;
  return { color: hexToRgba(c, a) };
});
</script>

<style scoped>
/* 字号随占位区域（与 v-img 可视区一致）的较短边缩放 */
.bip {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
  container-name: bip;
}

.bip__shimmer {
  position: absolute;
  inset: 0;
  animation: bip-shimmer 1.35s ease infinite;
}

.bip__mark {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  padding: 0 6px;
  text-align: center;
  pointer-events: none;
  animation: bip-mark-fade 3s ease-in-out infinite;
}

.bip__brand {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-weight: 650;
  letter-spacing: 0.08em;
  line-height: 1.1;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 2px;
}

.bip__brand--ghost {
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: bip-ghost-sweep 3.2s ease-in-out infinite;
}

/* 优先：容器查询 — 同时按宽(cqi)、短边(cqmin)取较小值，避免文章封面等窄长框里「ShareSDU」撑破 */
.bip--compact .bip__brand {
  font-size: clamp(9px, min(22cqmin, 17cqi), 15px);
  letter-spacing: 0.05em;
}

.bip--embed .bip__brand {
  font-size: clamp(11px, min(24cqmin, 15cqi), 20px);
  letter-spacing: 0.06em;
}

.bip--fullscreen .bip__brand {
  font-size: clamp(26px, 13cqmin, 56px);
  letter-spacing: 0.12em;
  font-weight: 700;
}

.bip__tagline {
  font-weight: 500;
  letter-spacing: 0.35em;
  margin-top: 4px;
  padding-left: 0.35em;
}

.bip--fullscreen .bip__tagline {
  font-size: clamp(13px, 5.5cqmin, 22px);
}

/* 无容器查询时回退：限制上限以免小图溢出 */
@supports not (container-type: size) {
  .bip--compact .bip__brand {
    font-size: clamp(9px, 3.8vmin, 15px);
  }
  .bip--embed .bip__brand {
    font-size: clamp(11px, 4.2vmin, 20px);
  }
  .bip--fullscreen .bip__brand {
    font-size: clamp(26px, 6.5vmin, 52px);
  }
  .bip--fullscreen .bip__tagline {
    font-size: clamp(13px, 2.6vmin, 20px);
  }
}

.bip__tagline--ghost {
  animation: bip-tagline-pulse 2.8s ease-in-out infinite;
}

@keyframes bip-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@keyframes bip-ghost-sweep {
  0%,
  100% {
    background-position: 120% 50%;
    opacity: 0.72;
  }
  50% {
    background-position: -20% 50%;
    opacity: 1;
  }
}

@keyframes bip-mark-fade {
  0%,
  100% {
    opacity: 0.82;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bip-tagline-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
