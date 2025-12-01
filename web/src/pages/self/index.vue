<template>
  <SelfPagePc v-if="deviceType === 'desktop'" v-bind="$attrs" />
  <SelfPageMobile v-else v-bind="$attrs" />
</template>

<script setup>
import { globalProperties } from '@/main';
import SelfPagePc from './pc.vue';
import SelfPageMobile from './mobile.vue';

defineOptions({
  name: 'SelfPage',
});

const deviceType = globalProperties.$deviceType;
</script>
