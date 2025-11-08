<!-- 异步组件加载中的占位组件 -->
<template>
  <div class="async-loading">
    <div class="loading-spinner">
      <v-progress-circular
        indeterminate
        :color="themeColor"
        :size="50"
        :width="4">
      </v-progress-circular>
    </div>
    <p class="loading-text">正在加载页面...</p>
  </div>
</template>

<script>
import { globalProperties } from '@/main';

export default {
  name: 'AsyncLoading',
  computed: {
    themeColor() {
      return globalProperties.$themeColor || '#1976d2';
    },
  },
};
</script>

<style scoped>
.async-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.loading-spinner {
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>

