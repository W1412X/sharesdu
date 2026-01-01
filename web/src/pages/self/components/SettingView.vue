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
      @click="handleToUrl('/#/developer')"
      prepend-icon="mdi-code-braces"
      color="grey"
      variant="outlined"
      text="开发者文档"
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
    <v-btn
      @click="handleToggleDarkMode"
      :prepend-icon="darkModeEnabled ? 'mdi-weather-night' : 'mdi-weather-sunny'"
      color="grey"
      variant="outlined"
      :text="darkModeEnabled ? '黑夜模式' : '白天模式'"
    ></v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toggleDarkMode, isDarkModeEnabled } from '@/utils/darkMode';

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

// 暗色模式状态
const darkModeEnabled = ref(false);

// 初始化暗色模式状态
onMounted(() => {
  darkModeEnabled.value = isDarkModeEnabled();
});

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

const handleToggleDarkMode = () => {
  darkModeEnabled.value = toggleDarkMode();
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

