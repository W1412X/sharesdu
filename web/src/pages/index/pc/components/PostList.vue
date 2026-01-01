<template>
  <div class="item-container">
    <template v-if="postList.length > 0">
      <post-item 
        v-for="item in postList" 
        :key="item.id" 
        :init-data="item"
      ></post-item>
    </template>
    <LoadMoreButton
      :all-load="allLoad"
      :loading="loading"
      :theme-color="themeColor"
      @load-more="$emit('load-more')"
    />
    <nothing-view 
      v-if="!loading && postList.length == 0" 
      icon="mdi-forum-outline" 
      text="暂无帖子" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import LoadMoreButton from './LoadMoreButton.vue';
import PostItem from '@/components/post/PostItem';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  postList: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
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

defineEmits(['load-more']);
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

  /* 在两列布局中的样式 - 通过父容器类名控制 */
  .post-list-column .item-container {
    width: 100%;
    max-width: 100%;
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


