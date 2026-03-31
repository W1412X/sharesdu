<template>
  <submit-loading-view :init-data="initData"></submit-loading-view>
</template>

<script>
import SubmitLoadingView from './SubmitLoadingView.vue';

export default {
  name: 'LoadingView',
  components: {
    SubmitLoadingView,
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
};
</script>
