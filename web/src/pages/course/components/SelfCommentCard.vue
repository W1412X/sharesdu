<template>
  <part-loading-view :state="!loadState" :text="'正在获取用户评论...'"></part-loading-view>
  <v-card v-if="loadState" class="self-comment-container-card" elevation="0">
    <div class="row-div">
      <v-rating
        :model-value="selfComment.score"
        density="compact"
        :color="selfComment.score === null ? '#8a8a8a' : themeColor"
        :disabled="true"
      ></v-rating>
      <v-spacer />
      <div v-if="!ifRated" class="title-bold text1">暂未评价此课程</div>
      <div v-if="ifRated" class="title-bold text1" :color="themeColor">我的评论</div>
    </div>
    <div v-if="ifRated" class="text-medium self-comment-text support-line-feed">
      <with-link-container :init-data="{ content: selfComment.comment }"></with-link-container>
    </div>
    <v-btn @click="$emit('edit-comment')" class="add-comment-btn" variant="tonal" :color="themeColor">
      <div v-if="!ifRated" class="title-medium-bold">评价此课程</div>
      <div v-if="ifRated" class="title-medium-bold">修改我的评价</div>
    </v-btn>
  </v-card>
</template>

<script setup>
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';

defineProps({
  selfComment: {
    type: Object,
    required: true,
  },
  ifRated: {
    type: Boolean,
    required: true,
  },
  loadState: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});
defineEmits(['edit-comment']);
</script>

<style scoped>
.row-div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.text1 {
  margin-top: 5px;
  margin-right: 5px;
  color: var(--theme-color);
}

.self-comment-text {
  width: 100%;
  white-space: pre-line;
  margin-top: 10px;
  word-break: break-all;
  overflow: hidden;
}

.add-comment-btn {
  margin-top: 10px;
  width: 100%;
}

@media screen and (min-width: 1000px) {
  .self-comment-container-card {
    margin-top: 10px;
    padding: 10px;
    width: 770px;
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
}

@media screen and (max-width: 1000px) {
  .self-comment-container-card {
    margin-top: 10px;
    padding: 10px;
    width: 98vw;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>

