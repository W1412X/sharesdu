<template>
  <div class="item-container">
    <div class="section-grid-container">
      <!-- 加载视图 -->
      <part-loading-view 
        v-if="loading"
        :state="loading"
        text="加载中..."
        class="loading-view"
      ></part-loading-view>
      <template v-else-if="sectionList.length > 0">
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
  </div>
</template>

<script setup>
import SectionItem from '@/components/section/SectionItem/index.vue';
import NothingView from '@/components/common/NothingView.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';

defineProps({
  sectionList: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
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
  .item-container {
    margin-bottom: 50px;
    display: flex;
    width: 750px;
    flex-direction: column;
    background-color: white;
  }

  .section-grid-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;
    width: 100%;
    position: relative;
  }

  .loading-view {
    width: 100%;
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    background-color: white;
  }

  .section-grid-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    padding: 0;
    width: 100%;
    position: relative;
  }

  .loading-view {
    width: 100%;
    min-height: 200px;
  }
}
</style>
