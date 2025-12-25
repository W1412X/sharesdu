<template>
  <v-card v-if="ifShow" class="comment-editor-card">
    <div class="title-bold">评价此课程</div>
    <v-rating
      v-model="localComment.score"
      size="medium"
      density="compact"
      style="margin: 0px; padding: 0px"
      :color="themeColor"
      :disabled="false"
    ></v-rating>
    <div class="row-div">
      <sensitive-text-area
        style="margin-top: 10px;"
        label="添加对此课程的评价(老师，课程难度，作业，意义)"
        variant="outlined"
        v-model="localComment.comment"
      ></sensitive-text-area>
      <emoji-picker @emoji="addEmoji"></emoji-picker>
    </div>
    <div class="dialog-bottom-bar">
      <v-btn
        :loading="loading"
        :disabled="loading"
        @click="handleSubmit"
        class="dialog-bottom-bar-btn"
        variant="text"
      >
        发表
      </v-btn>
      <v-btn @click="handleClose" variant="text" class="dialog-bottom-bar-btn">
        取消
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import EmojiPicker from '@/components/common/EmojiPicker.vue';

const props = defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  selfComment: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:if-show', 'submit', 'close']);

const localComment = ref({
  score: null,
  comment: null,
});

// 当对话框显示时，同步评论数据
watch(
  () => props.ifShow,
  (newVal) => {
    if (newVal) {
      localComment.value = {
        score: props.selfComment.score,
        comment: props.selfComment.comment,
      };
    }
  },
  { immediate: true }
);

// 同步 selfComment 变化
watch(
  () => props.selfComment,
  (newVal) => {
    if (props.ifShow) {
      localComment.value = {
        score: newVal.score,
        comment: newVal.comment,
      };
    }
  },
  { deep: true }
);

const addEmoji = (emoji) => {
  localComment.value.comment += emoji;
};

const handleSubmit = () => {
  emit('submit', localComment.value);
};

const handleClose = () => {
  emit('close');
  emit('update:if-show', false);
};
</script>

<style scoped>
.title-bold {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.row-div {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.dialog-bottom-bar {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
}

.dialog-bottom-bar-btn {
  margin-right: 10px;
}

@media screen and (min-width: 1000px) {
  .comment-editor-card {
    display: flex;
    width: 600px;
    flex-direction: column;
    padding: 10px;
  }
}

@media screen and (max-width: 1000px) {
  .comment-editor-card {
    display: flex;
    width: 80vw;
    flex-direction: column;
    padding: 10px;
  }
}
</style>

