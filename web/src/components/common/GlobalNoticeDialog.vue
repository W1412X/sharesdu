<!-- 全局通知弹窗组件 -->
<template>
  <v-dialog
    v-model="showDialog"
    :max-width="isMobile ? '90%' : '600'"
    transition="dialog-transition"
    persistent
    class="notice-dialog"
  >
    <v-card class="notice-card">
      <!-- 标题栏 -->
      <v-card-title class="notice-header">
        <div class="header-content">
          <div class="type-indicator" :class="indicatorClass"></div>
          <v-icon :icon="iconName" :color="iconColor" size="20" class="header-icon"></v-icon>
          <span class="header-title">{{ notice?.title || '通知' }}</span>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleClose"
          class="close-btn"
        >
          <v-icon icon="mdi-close" color="rgba(0, 0, 0, 0.6)"></v-icon>
        </v-btn>
      </v-card-title>

      <!-- 内容区域 -->
      <v-card-text class="notice-content">
        <div class="content-text" v-html="notice?.content || ''"></div>
      </v-card-text>

      <!-- 操作按钮 -->
      <v-card-actions class="notice-actions">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey-darken-1"
          @click="handleDontShow"
          class="action-btn"
        >
          不再显示
        </v-btn>
        <v-btn
          variant="text"
          :color="primaryColor"
          @click="handleClose"
          class="action-btn"
        >
          关闭
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { globalProperties } from '@/main';

const props = defineProps({
  notice: {
    type: Object,
    default: null,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'dont-show']);

const isMobile = computed(() => globalProperties.$deviceType === 'mobile');

// 通知类型配置
const typeConfig = {
  info: {
    icon: 'mdi-information',
    color: '#2196F3',
    indicatorClass: 'indicator-info',
  },
  warning: {
    icon: 'mdi-alert',
    color: '#FF9800',
    indicatorClass: 'indicator-warning',
  },
  error: {
    icon: 'mdi-alert-circle',
    color: '#F44336',
    indicatorClass: 'indicator-error',
  },
};

// 计算属性
const noticeType = computed(() => {
  return props.notice?.type || 'info';
});

const config = computed(() => {
  return typeConfig[noticeType.value] || typeConfig.info;
});

const iconName = computed(() => {
  return props.notice?.icon || config.value.icon;
});

const iconColor = computed(() => {
  return config.value.color;
});

const primaryColor = computed(() => {
  return config.value.color;
});

const indicatorClass = computed(() => {
  return config.value.indicatorClass;
});

const showDialog = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close');
    }
  },
});

// 处理关闭
const handleClose = () => {
  emit('close');
};

// 处理不再显示
const handleDontShow = () => {
  if (props.notice?.id) {
    emit('dont-show', props.notice.id);
  }
  handleClose();
};
</script>

<style scoped>
.notice-dialog :deep(.v-overlay__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  min-height: 56px;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  position: relative;
}

.type-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
}

.indicator-info {
  background-color: #2196F3;
}

.indicator-warning {
  background-color: #FF9800;
}

.indicator-error {
  background-color: #F44336;
}

.header-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

.header-title {
  font-size: var(--font-size-title, 18px);
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.4;
}

.close-btn {
  flex-shrink: 0;
  margin-left: 8px;
}

.notice-content {
  padding: 20px;
  min-height: 60px;
}

.content-text {
  font-size: var(--font-size-medium, 16px);
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
  word-wrap: break-word;
}

.content-text :deep(p) {
  margin: 0 0 12px 0;
}

.content-text :deep(p:last-child) {
  margin-bottom: 0;
}

.content-text :deep(a) {
  color: var(--theme-color, #2196F3);
  text-decoration: none;
}

.content-text :deep(a:hover) {
  text-decoration: underline;
}

.content-text :deep(strong) {
  font-weight: 600;
}

.content-text :deep(em) {
  font-style: italic;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.content-text :deep(li) {
  margin: 4px 0;
}

.notice-actions {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fafafa;
}

.action-btn {
  margin-left: 8px;
  text-transform: none;
  font-weight: 500;
}

/* 移动端适配 */
@media screen and (max-width: 1000px) {
  .notice-header {
    padding: 14px 16px;
    min-height: 52px;
  }

  .header-title {
    font-size: var(--font-size-medium, 16px);
  }

  .header-icon {
    font-size: 18px;
  }

  .notice-content {
    padding: 16px;
  }

  .content-text {
    font-size: var(--font-size-small, 14px);
  }

  .notice-actions {
    padding: 10px 16px;
  }
}
</style>
