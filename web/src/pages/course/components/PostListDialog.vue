<template>
  <v-overlay :model-value="ifShow" @update:model-value="$emit('update:if-show', $event)" class="posts-dialog">
    <div id="post-container" class="posts-container">
      <div style="display: flex; flex-direction: column; width: 100%;">
        <v-btn @click="$emit('open-editor')" variant="tonal" :color="themeColor">
          发表帖子
        </v-btn>
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
  </v-overlay>
</template>

<script setup>
import PostItem from '@/components/post/PostItem.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
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

defineEmits(['update:if-show', 'open-editor', 'load-more', 'alert', 'set-post-top']);
</script>

<style scoped>
.load-btn {
  width: 100%;
  margin-top: 10px;
}

@media screen and (min-width: 1000px) {
  .posts-dialog {
    padding: 0px;
    display: flex;
    flex-direction: row-reverse;
  }
  .posts-container {
    background-color: #ffffff;
    border-top: #8a8a8a 1px solid;
    width: 752px;
    padding: 1px;
    height: 100vh;
    overflow-y: auto;
  }
}

@media screen and (max-width: 1000px) {
  .posts-dialog {
    padding: 0px;
    display: flex;
    flex-direction: column-reverse;
  }
  .posts-container {
    background-color: #ffffff;
    border-top: #8a8a8a 1px solid;
    width: 100vw;
    height: 60vh;
    overflow-y: auto;
    border-radius: 5px;
  }
}
</style>

