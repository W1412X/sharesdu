<template>
  <v-card v-if="ifShow" class="dialog-card comment-dialog-card">
    <div class="title-bold">评论帖子</div>
    <div class="row-div editor-row">
      <sensitive-text-area
        v-model="localComment"
        class="comment-textarea"
        variant="outlined"
        density="compact"
        label="输入评论内容"
      />
      <emoji-picker @emoji="addEmoji"></emoji-picker>
    </div>
    <div class="dialog-bottom-btn-bar">
      <v-btn
        :disabled="loading"
        :loading="loading"
        @click="handleSubmit"
        variant="text"
        class="dialog-action-btn primary"
      >
        发表
      </v-btn>
      <v-btn @click="handleClose" variant="text" class="dialog-action-btn">取消</v-btn>
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
  comment: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:ifShow', 'submit', 'close']);

const localComment = ref('');

// 同步 comment 变化
watch(
  () => props.comment,
  (newVal) => {
    localComment.value = newVal || '';
  },
  { immediate: true }
);

// 当对话框打开时，重置内容
watch(
  () => props.ifShow,
  (newVal) => {
    if (newVal) {
      localComment.value = props.comment || '';
    }
  }
);

const addEmoji = (emoji) => {
  localComment.value += emoji;
};

const handleSubmit = () => {
  emit('submit', localComment.value);
};

const handleClose = () => {
  localComment.value = '';
  emit('close');
  emit('update:ifShow', false);
};
</script>

<style scoped>
.title-bold {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.dialog-card {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.editor-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  margin-top: 10px;
}

.comment-textarea {
  flex: 1;
}

.dialog-action-btn {
  min-width: 80px;
  color: #666666;
}

.dialog-action-btn.primary {
  color: var(--theme-color);
}

.dialog-bottom-btn-bar {
  padding: 10px;
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
}

@media screen and (min-width: 1000px) {
  .comment-dialog-card {
    max-width: 520px;
    width: 520px;
  }
}

@media screen and (max-width: 1000px) {
  .comment-dialog-card {
    max-width: 80vw;
    width: 80vw;
  }
}
</style>

