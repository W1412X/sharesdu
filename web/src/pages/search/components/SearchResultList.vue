<template>
  <div class="item-container">
    <nothing-view
      v-if="searchList.length === 0 && !loading"
      :color="hexToRgba('#8a8a8a', 0.5)"
      :text="unFoundText"
      icon="mdi-magnify"
    />
    <template v-if="searchType === '全部'">
      <hybrid-search-item
        v-for="item in searchList"
        :key="item.id"
        :init-data="item"
        :query="query"
      />
    </template>
    <template v-else>
      <search-item
        v-for="item in searchList"
        :key="item.id"
        :init-data="item"
        :need-icon="false"
        :query="query"
      />
    </template>
    <v-btn
      v-if="!allLoad"
      :loading="loading"
      :disabled="loading"
      style="width: 100%;"
      variant="text"
      :color="themeColor"
      @click="$emit('load-more')"
      text="加载更多"
    />
  </div>
</template>

<script setup>
import { hexToRgba } from '@/utils/other';
import SearchItem from '@/components/search/SearchItem.vue';
import HybridSearchItem from '@/components/search/HybridSearchItem.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  searchType: {
    type: String,
    required: true,
  },
  searchList: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  allLoad: {
    type: Boolean,
    required: true,
  },
  unFoundText: {
    type: String,
    required: true,
  },
  query: {
    type: Array,
    default: () => [],
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['load-more']);
</script>

<style scoped>
.item-container {
  display: flex;
  flex-direction: column;
  height: fit-content;
  background-color: white;
}

@media screen and (min-width: 1000px) {
  .item-container {
    width: 750px;
  }
}
</style>
