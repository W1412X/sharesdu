<template>
  <div class="section-grid-container">
    <template v-if="sectionList.length > 0">
      <section-item 
        v-for="item in sectionList" 
        :key="item.id" 
        :init-data="item"
      ></section-item>
    </template>
    <nothing-view 
      v-if="!loading && sectionList.length == 0" 
      icon="mdi-bulletin-board-outline" 
      text="暂无板块" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import SectionItem from '@/components/section/SectionItem/index.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  sectionList: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .section-grid-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    width: 100%;
    padding: 0;
  }

  /* 确保 SectionItem 在网格中正确显示 */
  .section-grid-container :deep(.section-card) {
    width: 100%;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .section-grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    padding: 0;
  }
}
</style>

