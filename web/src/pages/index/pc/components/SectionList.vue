<template>
  <div class="item-container">
    <div class="section-grid-container">
      <!-- 加载视图 -->
      <loading-content-wrapper
        :load-state="!loading"
        loading-text="加载中..."
        variant="list"
        :item-count="4"
        min-height="240px"
        class="loading-view"
      >
        <template v-if="sectionList.length > 0">
        <section-item 
          style="margin-bottom: 10px;"
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
      </loading-content-wrapper>
    </div>
  </div>
</template>

<script setup>
import SectionItem from '@/components/section/SectionItem/index.vue';
import NothingView from '@/components/common/NothingView.vue';
import LoadingContentWrapper from '@/components/common/LoadingContentWrapper.vue';

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
    gap: 24px;
    justify-content: flex-start;
    width: 100%;
    position: relative;
  }

  .loading-view {
    width: 100%;
    min-height: 200px;
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
    gap: 12px;
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
