<template>
  <div class="column-div-scroll">
    <div class="column-div">
      <template v-if="contentList.length > 0">
        <star-item
          :if-star-type="false"
          v-for="(item) in contentList"
          :key="item.type+item.id"
          :init-data="item"
          :post-id="itemType === 'reply' ? item.postId : undefined"
          :if-preview="itemType === 'reply'"
        ></star-item>
      </template>
      <v-btn
        v-if="displayMode === 'all' && !allLoad"
        :disabled="loading"
        :loading="loading"
        width="100%"
        @click="$emit('load-more')"
        variant="tonal"
        class="load-btn"
      >
        加载更多
      </v-btn>
      <nothing-view
        v-else-if="contentList.length === 0"
        :icon="emptyIcon"
        :text="emptyText"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      ></nothing-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StarItem from '@/components/star/StarItem.vue';
import NothingView from '@/components/common/NothingView.vue';

const props = defineProps({
  itemType: {
    type: String,
    required: true,
  },
  contentList: {
    type: Array,
    default: () => [],
  },
  displayMode: {
    type: String,
    default: 'preview', // preview/all
  },
  loading: {
    type: Boolean,
    default: false,
  },
  allLoad: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['load-more']);

const emptyIcon = computed(() => {
  switch (props.itemType) {
    case 'article':
      return 'mdi-book-open-outline';
    case 'post':
      return 'mdi-forum-outline';
    case 'reply':
      return 'mdi-comment-outline';
    default:
      return 'mdi-information-outline';
  }
});

const emptyText = computed(() => {
  switch (props.itemType) {
    case 'article':
      return '暂无文章';
    case 'post':
      return '暂无帖子';
    case 'reply':
      return '暂无回复';
    default:
      return '暂无内容';
  }
});
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.column-div-scroll {
  display: flex;
  flex-direction: column;
  max-height: 650px;
  height: fit-content;
  overflow: auto;
}

@media screen and (max-width: 1000px) {
  .column-div-scroll {
    max-height: 80vh;
  }
}

.load-btn {
  margin-top: 10px;
}
</style>

