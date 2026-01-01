<!-- 全部板块页面主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
  <SectionSetPagePc v-if="deviceType == 'desktop'" />
  <SectionSetPageMobile v-else />
</template>

<script setup>
import { globalProperties } from '@/main';
import SectionSetPagePc from './pc/index.vue';
import SectionSetPageMobile from './mobile/index.vue';

const deviceType = globalProperties.$deviceType;

defineOptions({
  name: 'SectionSetPage'
});
</script>

<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>

