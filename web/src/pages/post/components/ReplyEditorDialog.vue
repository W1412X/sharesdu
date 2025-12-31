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
    <!-- 图片预览区域 -->
    <div v-if="imgSrcList.length > 0" class="image-preview-row">
      <img-card
        v-for="(src, index) in imgSrcList"
        :key="index"
        :src="src"
        :width="80"
        :height="80"
        :editable="true"
        @delete_img="removeImage"
      ></img-card>
    </div>
    <!-- 添加图片按钮 -->
    <v-btn
      @click="triggerFileInput"
      variant="text"
      :color="themeColor"
      prepend-icon="mdi-image-plus"
      size="small"
      class="add-image-btn"
    >
      添加图片
    </v-btn>
    <div class="dialog-bottom-btn-bar">
      <v-btn
        :disabled="loading || isUploading"
        :loading="loading || isUploading"
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
import { globalProperties } from '@/main';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import EmojiPicker from '@/components/common/EmojiPicker.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import { uploadArticleImage } from '@/api/modules/image';
import { compressImage } from '@/utils/imageUtils';

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

const themeColor = globalProperties.$themeColor;
const apiUrl = globalProperties.$apiUrl;
const localComment = ref('');
const imgSrcList = ref([]);
const imgDict = ref({});
const isUploading = ref(false);

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
      // 重置图片列表
      imgSrcList.value.forEach(src => URL.revokeObjectURL(src));
      imgSrcList.value = [];
      imgDict.value = {};
    }
  }
);

const addEmoji = (emoji) => {
  localComment.value += emoji;
};

const triggerFileInput = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.addEventListener('change', handleFileChange);
  input.click();
};

const handleFileChange = async (event) => {
  const files = Array.from(event.target.files);
  for (let i = 0; i < files.length; i++) {
    try {
      files[i] = await compressImage(files[i], 1024 * 4);
    } catch (error) {
      console.error(`Failed to compress image ${i}:`, error);
      // 如果压缩失败，使用原始文件
    }
    const tmp = URL.createObjectURL(files[i]);
    imgSrcList.value.push(tmp);
    imgDict.value[tmp] = files[i];
  }
};

const removeImage = (src) => {
  const index = imgSrcList.value.indexOf(src);
  if (index > -1) {
    imgSrcList.value.splice(index, 1);
    URL.revokeObjectURL(src);
    delete imgDict.value[src];
  }
};

const handleSubmit = async () => {
  if (imgSrcList.value.length > 0) {
    isUploading.value = true;
    let finalContent = localComment.value;
    
    // 上传所有图片
    for (let i = 0; i < imgSrcList.value.length; i++) {
      const img = imgSrcList.value[i];
      const file = imgDict.value[img];
      
      try {
        // 再次压缩以确保大小
        const compressedFile = await compressImage(file, 4 * 1024);
        const response = await uploadArticleImage(compressedFile);
        
        if (response.status === 200 || response.status === 201) {
          finalContent += `[${apiUrl + response.data.image_url}]`;
        } else {
          console.error('Failed to upload image:', response.message);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
    
    isUploading.value = false;
    emit('submit', finalContent);
  } else {
  emit('submit', localComment.value);
  }
};

const handleClose = () => {
  // 清理图片资源
  imgSrcList.value.forEach(src => URL.revokeObjectURL(src));
  imgSrcList.value = [];
  imgDict.value = {};
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

.image-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.add-image-btn {
  margin-top: 5px;
  margin-bottom: 5px;
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

