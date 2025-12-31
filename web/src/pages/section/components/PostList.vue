<template>
  <div class="posts-list-container">
    <div class="column-div">
      <template v-if="postItems.length > 0">
        <post-item
          v-for="item in postItems"
          :key="item.id"
          :init-data="item"
          :if-parent-author="ifParentAuthor"
          @alert="$emit('alert', $event)"
          @set_post_top="$emit('set-post-top', $event)"
        />
      </template>
      <v-btn
        v-if="!allLoad"
        @click="$emit('load-more')"
        :loading="loading"
        :disabled="loading"
        variant="text"
        class="load-btn"
        :color="themeColor"
      >
        加载更多
      </v-btn>
      <nothing-view
        v-if="!loading && postItems.length == 0"
        icon="mdi-forum-outline"
        text="暂无帖子"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      />
    </div>
  </div>
</template>

<script setup>
import PostItem from '@/components/post/PostItem';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  postItems: {
    type: Array,
    required: true,
  },
  ifParentAuthor: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  allLoad: {
    type: Boolean,
    default: false,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['load-more', 'alert', 'set-post-top']);
</script>

<style scoped>
.column-div {
  display: flex;
  flex-direction: column;
}

.load-btn {
  width: 100%;
  margin-top: 10px;
}

@media screen and (min-width: 1000px) {
  .posts-list-container {
    width: 750px;
    padding: 0;
  }
}

@media screen and (max-width: 1000px) {
  .posts-list-container {
    width: 100vw;
    padding: 0;
  }
}
</style>

