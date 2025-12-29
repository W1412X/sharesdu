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
      <with-link-container :init-data="{ content: displayContent }"></with-link-container>
      <!-- 图片列表（最多3张） -->
      <div v-if="displayImgList && displayImgList.length > 0" class="self-comment-image-list">
        <div
          v-for="(src, index) in displayImgList"
          :key="index"
          class="self-comment-image-item"
          @click="handleImageClick(index)"
        >
          <img-card
            :src="src"
            :width="80"
            :height="80"
            :editable="false"
            :clickable="false"
          ></img-card>
        </div>
      </div>
      <!-- 图片查看器 -->
      <image-viewer
        v-model="showImageViewer"
        :image-list="imgList || []"
        :initial-index="currentImageIndex"
        @close="showImageViewer = false"
      ></image-viewer>
    </div>
    <v-btn @click="$emit('edit-comment')" class="add-comment-btn" variant="tonal" :color="themeColor">
      <div v-if="!ifRated" class="title-medium-bold">评价此课程</div>
      <div v-if="ifRated" class="title-medium-bold">修改我的评价</div>
    </v-btn>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import ImageViewer from '@/components/common/ImageViewer.vue';
import { extractImageLinksInBrackets } from '@/utils/other';
import { removeImageLinksInBrackets } from '@/utils/imageUtils';

const props = defineProps({
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

// 提取图片链接和文本内容
const imgList = ref([]);
const displayContent = ref('');

// 监听评论内容变化，提取图片
watch(
  () => props.selfComment.comment,
  (newComment) => {
    if (newComment) {
      imgList.value = extractImageLinksInBrackets(newComment);
      displayContent.value = removeImageLinksInBrackets(newComment);
    } else {
      imgList.value = [];
      displayContent.value = '';
    }
  },
  { immediate: true }
);

// 最多显示3张图片
const displayImgList = computed(() => {
  if (!imgList.value || imgList.value.length === 0) {
    return [];
  }
  return imgList.value.slice(0, 3);
});

// 图片查看器
const showImageViewer = ref(false);
const currentImageIndex = ref(0);

const handleImageClick = (index) => {
  currentImageIndex.value = index;
  showImageViewer.value = true;
};
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

.self-comment-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.self-comment-image-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.self-comment-image-item:hover {
  transform: scale(1.05);
}

@media screen and (min-width: 1000px) {
  .self-comment-container-card {
    margin-top: 10px;
    padding: 10px;
    width: 800px;
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

