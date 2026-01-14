<template>
  <v-app-bar
    :elevation="0"
    style="border-bottom: 1px solid #e0e0e0;"
  >
    <v-app-bar-title>
      <span class="text-big-title-bold" style="color: var(--welcome-theme-color, #667eea);">ShareSDU</span>
    </v-app-bar-title>
    
    <v-spacer></v-spacer>
    <v-btn
      href="https://sducsguide.github.io/SDUCSGuide/"
      target="_blank"
      variant="text"
      :color="themeColor"
      class="text-title-bold"
      append-icon="mdi-open-in-new"
      style="margin-top: 4px;"
    >
      SDUCS Guide
    </v-btn>
    <v-btn
      @click="handleDownloadApp"
      variant="text"
      :color="themeColor"
      class="text-title-bold"
      prepend-icon="mdi-download"
      style="margin-top: 4px;"
    >
      APP
    </v-btn>
    <v-btn
      @click="handleDeveloperClick"
      variant="text"
      :color="themeColor"
      class="text-title-bold"
    >
      开发文档
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { inject } from 'vue';
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';

const themeColor = globalProperties.$themeColor;
defineEmits(['download-app']);

// 从父组件注入下载函数
const downloadApp = inject('downloadApp', null);

const handleDeveloperClick = () => {
  openPage('router', { name: 'DeveloperPage' });
};

const handleDownloadApp = () => {
  if (downloadApp) {
    downloadApp();
  }
};
</script>

<style scoped>
</style>

