<!-- 异步组件加载失败的错误组件 -->
<template>
  <div class="async-error">
    <v-icon color="error" size="64">mdi-alert-circle-outline</v-icon>
    <h3 class="error-title">页面加载失败</h3>
    <p class="error-message">{{ errorMessage }}</p>
    <v-btn
      color="primary"
      @click="handleRetry">
      重试
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'AsyncError',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  computed: {
    errorMessage() {
      if (this.error) {
        return this.error?.message || '加载页面时发生错误，请稍后重试';
      }
      return '加载页面时发生错误，请稍后重试';
    },
  },
  methods: {
    handleRetry() {
      // 刷新页面以重试加载
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.async-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  padding: 32px;
  text-align: center;
}

.error-title {
  margin: 16px 0 8px;
  color: #333;
  font-size: var(--font-size-logo);
  font-weight: 500;
}

.error-message {
  margin: 0 0 24px;
  color: #666;
  font-size: var(--font-size-small);
  max-width: 500px;
}
</style>

