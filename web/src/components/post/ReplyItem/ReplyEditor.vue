<!-- 回复编辑器组件 -->
<template>
  <v-dialog v-model="ifShowDialog" class="reply-dialog">
    <div class="dialog-wrapper">
      <v-card v-if="ifShowEditor" class="dialog-card">
        <div class="title-bold">
          回复评论
        </div>
        <div class="row-div editor-row">
          <SensitiveTextArea 
            v-model="localReplyContent" 
            class="reply-textarea" 
            variant="outlined" 
            density="compact"
            label="输入评论内容" 
          />
          <EmojiPicker @emoji="addEmoji"></EmojiPicker>
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
            @click="handleSubmit" 
            :loading="isUploading" 
            :disabled="isUploading" 
            variant="text" 
            class="dialog-action-btn primary"
          >
            发表
          </v-btn>
          <v-btn 
            @click="handleClose" 
            variant="text" 
            class="dialog-action-btn"
          >
            取消
          </v-btn>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { globalProperties } from '@/main';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import EmojiPicker from '@/components/common/EmojiPicker.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import { uploadArticleImage } from '@/api/modules/image';
import { compressImage } from '@/utils/imageUtils';
import { addHeaderToReply, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert } from '@/utils/other';
import { createReplyUnderPost } from '@/api/modules/post';
import { getCookie } from '@/utils/cookie';

export default {
  name: 'ReplyEditor',
  components: {
    SensitiveTextArea,
    EmojiPicker,
    ImgCard,
  },
  props: {
    ifShow: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: String,
      required: true,
    },
    parentAuthorName: {
      type: String,
      default: null,
    },
    parentReplyId: {
      type: String,
      default: null,
    },
  },
  emits: ['update:ifShow', 'reply', 'alert', 'set-loading', 'close'],
  setup(props, { emit }) {
    const themeColor = globalProperties.$themeColor;
    const apiUrl = globalProperties.$apiUrl;
    const ifShowEditor = ref(false);
    const localReplyContent = ref('');
    const imgSrcList = ref([]);
    const imgDict = ref({});
    const isUploading = ref(false);

    const ifShowDialog = computed(() => {
      return ifShowEditor.value;
    });

    // 监听外部 ifShow 变化
    watch(
      () => props.ifShow,
      (newVal) => {
        ifShowEditor.value = newVal;
        if (newVal) {
          // 打开时重置内容
          localReplyContent.value = '';
          imgSrcList.value.forEach(src => URL.revokeObjectURL(src));
          imgSrcList.value = [];
          imgDict.value = {};
        }
      },
      { immediate: true }
    );

    // 监听内部状态变化，同步到外部
    watch(ifShowEditor, (newVal) => {
      emit('update:ifShow', newVal);
    });

    const addEmoji = (emoji) => {
      localReplyContent.value += emoji;
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
      if (localReplyContent.value.length <= 5 && imgSrcList.value.length === 0) {
        emit('alert', getNormalWarnAlert("评论内容过短"));
        return;
      }

      let content = localReplyContent.value;

      // 如果有图片，先上传图片
      if (imgSrcList.value.length > 0) {
        isUploading.value = true;
        emit('set-loading', getLoadMsg("正在上传图片..."));

        for (let i = 0; i < imgSrcList.value.length; i++) {
          const img = imgSrcList.value[i];
          let file = imgDict.value[img];
          try {
            file = await compressImage(file, 4 * 1024);
          } catch (error) {
            console.error(`Failed to compress image ${i} before upload:`, error);
          }
          const response = await uploadArticleImage(file);
          if (response.status != 200 && response.status != 201) {
            emit('alert', getNormalErrorAlert(response.message));
            emit('set-loading', getCancelLoadMsg());
            isUploading.value = false;
            return;
          }
          content += `[${apiUrl + response.data.image_url}]`;
        }

        emit('set-loading', getCancelLoadMsg());
        isUploading.value = false;
      }

      // 添加回复头部
      if (props.parentAuthorName && props.parentReplyId) {
        content = addHeaderToReply(content, props.parentAuthorName, props.parentReplyId);
      }

      emit('set-loading', getLoadMsg("正在提交评论..."));
      const response = await createReplyUnderPost(props.postId, content, props.parentReplyId);
      emit('set-loading', getCancelLoadMsg());

      if (response.status == 200 || response.status == 201) {
        emit('alert', getNormalSuccessAlert("评论成功"));
        localReplyContent.value = "";
        // 清理图片资源
        imgSrcList.value.forEach(src => URL.revokeObjectURL(src));
        imgSrcList.value = [];
        imgDict.value = {};
        emit('reply', {
          id: response.reply_id,
          content: content,
          authorName: getCookie("userName"),
          authorId: getCookie("userId"),
          likeNum: 0,
          publishTime: new Date().toLocaleString(),
        });
        ifShowEditor.value = false;
      } else {
        emit('alert', getNormalErrorAlert(response.message));
      }
    };

    const handleClose = () => {
      // 清理图片资源
      imgSrcList.value.forEach(src => URL.revokeObjectURL(src));
      imgSrcList.value = [];
      imgDict.value = {};
      localReplyContent.value = "";
      ifShowEditor.value = false;
      emit('close');
    };

    return {
      themeColor,
      ifShowDialog,
      ifShowEditor,
      localReplyContent,
      imgSrcList,
      isUploading,
      addEmoji,
      triggerFileInput,
      removeImage,
      handleSubmit,
      handleClose,
    };
  },
}
</script>

<style scoped>
.reply-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dialog-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.dialog-card {
  padding: 10px;
  display: flex;
  max-width: 400px;
  flex-direction: column;
}

.title-bold {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.row-div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.reply-textarea {
  margin-top: 4px;
  flex: 1;
}

.editor-row {
  gap: 10px;
  align-items: stretch;
}

.image-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.add-image-btn {
  margin-top: 5px;
  margin-bottom: 5px;
}

.dialog-bottom-btn-bar {
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  margin-top: 4px;
}

.dialog-action-btn {
  min-width: 72px;
  color: #666666;
}

.dialog-action-btn.primary {
  color: var(--theme-color);
}
</style>

