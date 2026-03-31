<template>
  <div class="async-loading">
    <share-sdu-breath-view
      compact
    ></share-sdu-breath-view>
  </div>
</template>

<script>
import ShareSduBreathView from '@/components/common/ShareSduBreathView.vue';

export default {
  name: 'AsyncLoading',
  components: {
    ShareSduBreathView,
  },
};
</script>

<style scoped>
.async-loading {
  width: 100%;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
