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
    <div class="dialog-bottom-bar">
      <v-btn
        :loading="loading || isUploading"
        :disabled="loading || isUploading"
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
import { globalProperties } from '@/main';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import EmojiPicker from '@/components/common/EmojiPicker.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import { uploadArticleImage } from '@/api/modules/image';
import { compressImage } from '@/utils/imageUtils';
import { extractImageLinksInBrackets } from '@/utils/other';
import { removeImageLinksInBrackets } from '@/utils/imageUtils';

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

const apiUrl = globalProperties.$apiUrl;
const localComment = ref({
  score: null,
  comment: null,
});
const imgSrcList = ref([]);
const imgDict = ref({}); // 存储图片URL或File对象
const existingImages = ref([]); // 存储已有图片的URL（从评论中解析出来的）
const isUploading = ref(false);

// 解析评论内容中的图片
const parseExistingImages = (comment) => {
  if (!comment) {
    return { images: [], text: '' };
  }
  
  // 提取图片链接
  const imageUrls = extractImageLinksInBrackets(comment);
  // 移除图片链接，得到纯文本
  const textContent = removeImageLinksInBrackets(comment);
  
  return { images: imageUrls, text: textContent };
};

// 当对话框显示时，同步评论数据
watch(
  () => props.ifShow,
  (newVal) => {
    if (newVal) {
      localComment.value = {
        score: props.selfComment.score,
        comment: props.selfComment.comment,
      };
      
      // 清理之前的图片资源（只清理本地创建的URL）
      imgSrcList.value.forEach(src => {
        // 只清理本地创建的 ObjectURL，不清理网络URL
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
      });
      imgSrcList.value = [];
      imgDict.value = {};
      existingImages.value = [];
      
      // 解析已有评论中的图片
      if (props.selfComment.comment) {
        const { images, text } = parseExistingImages(props.selfComment.comment);
        existingImages.value = images;
        
        // 将已有图片添加到预览列表
        images.forEach(imgUrl => {
          imgSrcList.value.push(imgUrl);
          // 已有图片用URL字符串标识，不是File对象
          imgDict.value[imgUrl] = imgUrl;
        });
        
        // 更新文本内容（移除图片链接）
        localComment.value.comment = text;
      }
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
      
      // 重新解析图片
      if (newVal.comment) {
        const { images, text } = parseExistingImages(newVal.comment);
        existingImages.value = images;
        
        // 清理之前的图片资源
        imgSrcList.value.forEach(src => {
          if (src.startsWith('blob:')) {
            URL.revokeObjectURL(src);
          }
        });
        imgSrcList.value = [];
        imgDict.value = {};
        
        // 添加已有图片
        images.forEach(imgUrl => {
          imgSrcList.value.push(imgUrl);
          imgDict.value[imgUrl] = imgUrl;
        });
        
        // 更新文本内容
        localComment.value.comment = text;
      }
    }
  },
  { deep: true }
);

const addEmoji = (emoji) => {
  localComment.value.comment += emoji;
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
    // 只清理本地创建的 ObjectURL，不清理网络URL
    if (src.startsWith('blob:')) {
      URL.revokeObjectURL(src);
    }
    delete imgDict.value[src];
  }
};

const handleSubmit = async () => {
  let finalComment = { ...localComment.value };
  
  if (imgSrcList.value.length > 0) {
    isUploading.value = true;
    let commentContent = localComment.value.comment || '';
    
    // 处理所有图片
    for (let i = 0; i < imgSrcList.value.length; i++) {
      const img = imgSrcList.value[i];
      const fileOrUrl = imgDict.value[img];
      
      // 判断是已有图片（URL字符串）还是新上传的图片（File对象）
      if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('http')) {
        // 已有图片，直接使用URL
        commentContent += `[${fileOrUrl}]`;
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        // 新上传的图片，需要上传
        try {
          const compressedFile = await compressImage(fileOrUrl, 4 * 1024);
          const response = await uploadArticleImage(compressedFile);
          
          if (response.status === 200 || response.status === 201) {
            commentContent += `[${apiUrl + response.data.image_url}]`;
          } else {
            console.error('Failed to upload image:', response.message);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }
    
    finalComment.comment = commentContent;
    isUploading.value = false;
  }
  
  emit('submit', finalComment);
};

const handleClose = () => {
  // 清理图片资源（只清理本地创建的URL）
  imgSrcList.value.forEach(src => {
    if (src.startsWith('blob:')) {
      URL.revokeObjectURL(src);
    }
  });
  imgSrcList.value = [];
  imgDict.value = {};
  existingImages.value = [];
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

