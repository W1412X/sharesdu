<template>
  <div id="comments-container" class="comments-container">
    <div class="comment-column">
      <template v-if="commentList.length > 0">
        <course-comment
          v-for="(item, index) in commentList"
          :key="index"
          :init-data="item"
        ></course-comment>
      </template>
      <v-btn
        v-if="!allLoad"
        :loading="loading"
        :disabled="loading"
        :color="themeColor"
        class="load-more-btn"
        variant="text"
        @click="$emit('load-more')"
      >
        加载更多
      </v-btn>
      <nothing-view
        v-else-if="commentList.length <= 0 && !loading"
        icon="mdi-comment-text-outline"
        text="暂无评论"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      ></nothing-view>
    </div>
  </div>
</template>

<script setup>
import CourseComment from '@/components/course/CourseComment.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  commentList: {
    type: Array,
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

defineEmits(['load-more']);
</script>

<style scoped>
.load-more-btn {
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

.comment-column {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  background-color: white;
}

@media screen and (max-width: 1000px) {
  .comment-column {
    width: 100vw;
  }
}
</style>

