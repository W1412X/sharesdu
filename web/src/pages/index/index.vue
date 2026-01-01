<template>
  <IndexPagePc v-if="deviceType == 'desktop'" />
  <IndexPageMobile v-else />
</template>

<script setup>
import { globalProperties } from '@/main';
const deviceType = globalProperties.$deviceType;
import IndexPagePc from './pc/index.vue';
import IndexPageMobile from './mobile/index.vue';
defineOptions({
  name: 'IndexPage'
});
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .full-screen {
    width: 100%;
    height: 100%;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .full-screen {
    width: 100vw;
    height: 100vh;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}
</style>

