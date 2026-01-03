<!-- 全局消息通知组件 - Toast 样式 -->
<template>
  <transition name="toast-slide">
    <div 
      v-if="alertMsg.state" 
      class="global-toast" 
      :class="[toastClass, { 'toast-clickable': isClickable }]"
      @click="handleClick"
    >
      <div class="toast-icon">
        <v-icon :icon="iconName" :color="iconColor" :size="iconSize"></v-icon>
      </div>
      <div class="toast-text">
        {{ displayText }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  alertMsg: {
    type: Object,
    required: true,
    default: () => ({
      state: false,
      color: null,
      title: null,
      content: null,
    }),
  },
});

const emit = defineEmits(['close']);

// 根据消息类型获取图标
const iconName = computed(() => {
  switch (props.alertMsg.color) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'notification':
      return 'mdi-bell';
    case 'info':
    default:
      return 'mdi-information';
  }
});

// 是否可点击
const isClickable = computed(() => {
  return props.alertMsg.clickable === true && props.alertMsg.targetUrl;
});

// 处理点击事件
const handleClick = () => {
  if (isClickable.value && props.alertMsg.targetUrl) {
    // 关闭消息
    closeMessage();
    // 跳转到目标页面
    const url = props.alertMsg.targetUrl;
    if (url.startsWith('#')) {
      window.location.href = url;
    } else {
      window.open(url, '_self');
    }
  }
};

// 图标颜色
const iconColor = computed(() => {
  return '#ffffff';
});

// 图标大小（响应式）
const iconSize = computed(() => {
  // Toast 样式使用较小的图标
  return 16;
});

// Toast 容器类名
const toastClass = computed(() => {
  return `toast-${props.alertMsg.color || 'info'}`;
});

// 显示的文本（合并 title 和 content）
const displayText = computed(() => {
  const parts = [];
  if (props.alertMsg.title) {
    parts.push(props.alertMsg.title);
  }
  if (props.alertMsg.content) {
    parts.push(props.alertMsg.content);
  }
  return parts.join(' ');
});

// 自动关闭定时器
let autoCloseTimer = null;

// 关闭消息
const closeMessage = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
  // 通过事件通知父组件关闭消息
  emit('close');
};

// 监听消息状态变化，自动关闭
watch(() => props.alertMsg.state, (newVal) => {
  if (newVal) {
    // 清除之前的定时器
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    // 设置新的自动关闭定时器（3秒）
    autoCloseTimer = setTimeout(() => {
      closeMessage();
    }, 3000);
  } else {
    // 如果消息关闭，清除定时器
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
}, { immediate: true });

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
});
</script>

<style scoped>
.global-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  pointer-events: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.global-toast.toast-clickable {
  pointer-events: all;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-text {
  flex: 1;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: #ffffff;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Toast 类型颜色 - 使用半透明背景 */
.toast-success {
  background-color: rgba(76, 175, 80, 0.9);
}

.toast-error {
  background-color: rgba(244, 67, 54, 0.9);
}

.toast-warning {
  background-color: rgba(255, 152, 0, 0.9);
}

.toast-info {
  background-color: rgba(33, 150, 243, 0.9);
}

.toast-notification {
  background-color: rgba(156, 39, 176, 0.9);
}

.toast-clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.toast-clickable:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
.toast-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.toast-slide-enter-from {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

/* 移动端适配 */
@media screen and (max-width: 1000px) {
  .global-toast {
    top: 12px;
    padding: 8px 14px;
    gap: 6px;
    border-radius: 4px;
    max-width: calc(100% - 24px);
  }

  .toast-text {
    font-size: var(--font-size-tiny);
  }
}

/* PC端适配 */
@media screen and (min-width: 1001px) {
  .global-toast {
    top: 20px;
    padding: 10px 18px;
    gap: 8px;
  }
}
</style>

