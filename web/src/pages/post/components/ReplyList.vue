<template>
  <div id="comments-container" class="comments-container surface-card">
    <div class="column-div">
      <template v-if="replyList.length > 0">
        <reply-item
          v-for="reply in replyList"
          :key="reply.id"
          :init-data="reply"
          :post-id="postId"
          @show_parent="$emit('show-parent', $event)"
          @reply="$emit('reply', $event)"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
        ></reply-item>
      </template>
      <v-btn
        v-if="!allLoad"
        :loading="loading"
        :disabled="loading"
        variant="text"
        class="load-btn"
        :color="themeColor"
        @click="$emit('load-more')"
      >
        加载更多
      </v-btn>
      <nothing-view
        v-if="replyList.length == 0 && !loading"
        icon="mdi-comment-outline"
        text="暂无回复"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      ></nothing-view>
    </div>
  </div>
</template>

<script setup>
import ReplyItem from '@/components/post/ReplyItem.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  replyList: {
    type: Array,
    required: true,
  },
  postId: {
    type: String,
    required: true,
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

defineEmits(['show-parent', 'reply', 'alert', 'set-loading', 'load-more']);
</script>

<style scoped>
.surface-card {
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.column-div {
  display: flex;
  flex-direction: column;
  background-color: white;
}

.load-btn {
  width: 100%;
}

.comments-container {
  background-color: #ffffff;
  border-top: #8a8a8a 1px solid;
  width: 100%;
  padding: 1px;
  margin-bottom: 40px;
  height: fit-content;
}

@media screen and (min-width: 1000px) {
  .comments-container {
    width: 900px;
  }
}

@media screen and (max-width: 1000px) {
  .comments-container {
    width: 100vw;
    border-radius: 5px;
  }
}
</style>


