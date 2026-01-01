<template>
  <div class="item-container">
    <ArticleSortBar 
      :sort-method="sortMethod"
      :theme-color="themeColor"
      :if-mobile="ifMobile"
      @update:sort-method="$emit('update:sortMethod', $event)"
    />
    <template v-if="articleList.length > 0">
      <article-item 
        v-for="item in articleList" 
        :key="item.id" 
        :init-data="item"
      ></article-item>
    </template>
    <LoadMoreButton
      :all-load="allLoad"
      :loading="loading"
      :theme-color="themeColor"
      @load-more="$emit('load-more')"
    />
    <nothing-view 
      v-if="!loading && articleList.length == 0" 
      icon="mdi-book-open-outline" 
      text="暂无文章" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import ArticleSortBar from './ArticleSortBar.vue';
import LoadMoreButton from './LoadMoreButton.vue';
import ArticleItem from '@/components/article/ArticleItem';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  articleList: {
    type: Array,
    required: true,
  },
  sortMethod: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  ifMobile: {
    type: Boolean,
    required: true,
  },
  allLoad: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:sortMethod', 'load-more']);
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
}

/** mobile */
@media screen and (max-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    background-color: white;
  }
}
</style>


