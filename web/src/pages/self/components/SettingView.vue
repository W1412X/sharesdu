<template>
  <div class="column-list">
    <v-btn
      @click="handleToUrl('/#/document/to_know')"
      prepend-icon="mdi-bulletin-board"
      color="grey"
      variant="outlined"
      text="入站须知"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/document/privacy')"
      prepend-icon="mdi-lock-outline"
      color="grey"
      variant="outlined"
      text="隐私政策"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/document/about_us')"
      prepend-icon="mdi-information-variant"
      color="grey"
      variant="outlined"
      text="关于我们"
    ></v-btn>
    <v-btn
      :loading="loading.loadBlock"
      :disabled="loading.loadBlock"
      @click="handleShowBlockList"
      prepend-icon="mdi-account-cancel"
      color="grey"
      variant="outlined"
      text="黑名单"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/welcome')"
      prepend-icon="mdi-application-outline"
      color="grey"
      variant="outlined"
      text="下载APP"
    ></v-btn>
    <v-btn
      @click="handleShowColorSelector"
      prepend-icon="mdi-account-box"
      color="grey"
      variant="outlined"
      text="个性化主题"
    ></v-btn>
  </div>
</template>

<script setup>
// Props
defineProps({
  loading: {
    type: Object,
    default: () => ({
      loadBlock: false,
    }),
  },
});

// Emits
const emit = defineEmits(['to-url', 'show-block-list', 'show-color-selector']);

// 处理方法
const handleToUrl = (url) => {
  emit('to-url', url);
};

const handleShowBlockList = () => {
  emit('show-block-list');
};

const handleShowColorSelector = () => {
  emit('show-color-selector');
};
</script>

<style scoped>
@media screen and (min-width: 1000px) {
  .column-list {
    width: 750px;
    display: flex;
    flex-direction: column;
  }
}

@media screen and (max-width: 1000px) {
  .column-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>

