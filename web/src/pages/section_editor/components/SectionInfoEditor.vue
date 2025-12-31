<template>
  <v-dialog v-model="ifShowTagDialog" style="width: 100%;height:100%;justify-content: center;">
    <div v-if="ifShowTagInput" style="width: 100%;height:100%;justify-content: center;display: flex">
      <v-card class="dialog-card">
        <div class="title-bold">添加标签</div>
        <sensitive-text-area
          v-model="inputingTag"
          label="输入标签"
          rows="1"
          density="compact"
          variant="outlined"
        ></sensitive-text-area>
        <div class="dialog-bottom-btn-bar">
          <v-btn @click="addTag" variant="text">添加</v-btn>
          <v-btn @click="setTagInputState(false)" variant="text">取消</v-btn>
        </div>
      </v-card>
    </div>
  </v-dialog>
  
  <div class="section-info-editor">
    <div class="info-section">
      <!-- 板块名称 -->
      <div class="info-row">
        <div class="label-container">
          <span class="label-text">板块名称</span>
          <v-tooltip activator="parent" location="top">
            <div class="tooltip-content">
              <div class="tooltip-title">板块名称</div>
              <div class="tooltip-body">板块名称用于标识这个讨论区，会显示在板块列表和板块详情页。建议使用简洁明了的名称。</div>
            </div>
          </v-tooltip>
          <v-icon icon="mdi-help-circle-outline" color="#8a8a8a" size="16" class="help-icon"></v-icon>
        </div>
        <div class="input-container">
          <sensitive-text-field
            v-model="localData.articleSection"
            label="请输入板块名称"
            variant="outlined"
            density="compact"
            :maxlength="50"
            :counter="50"
            :rules="sectionRules"
            @update:model-value="handleDataChange"
          ></sensitive-text-field>
        </div>
      </div>

      <!-- 板块摘要 -->
      <div class="info-row">
        <div class="label-container">
          <span class="label-text">板块摘要</span>
          <v-tooltip activator="parent" location="top">
            <div class="tooltip-content">
              <div class="tooltip-title">板块摘要</div>
              <div class="tooltip-body">添加板块摘要，简要描述该板块的主题和用途，帮助用户了解这个讨论区的定位。</div>
            </div>
          </v-tooltip>
          <v-icon icon="mdi-help-circle-outline" color="#8a8a8a" size="16" class="help-icon"></v-icon>
        </div>
        <div class="input-container">
          <sensitive-text-area
            v-model="localData.summary"
            label="添加不多于200字的简介"
            variant="outlined"
            :maxlength="200"
            :counter="200"
            rows="3"
            @update:model-value="handleDataChange"
          ></sensitive-text-area>
        </div>
      </div>

      <!-- 板块封面 -->
      <div class="info-row">
        <div class="label-container">
          <span class="label-text">板块封面</span>
          <v-tooltip activator="parent" location="top">
            <div class="tooltip-content">
              <div class="tooltip-title">板块封面</div>
              <div class="tooltip-body">添加封面图使板块更具吸引力，建议使用与板块主题相关的图片。</div>
            </div>
          </v-tooltip>
          <v-icon icon="mdi-help-circle-outline" color="#8a8a8a" size="16" class="help-icon"></v-icon>
        </div>
        <div class="input-container">
          <div class="cover-upload-container">
            <v-btn 
              v-if="!localData.coverLink" 
              @click="selectImage()" 
              color="grey" 
              variant="outlined" 
              class="cover-upload-btn">
              <v-icon icon="mdi-image-plus" size="24"></v-icon>
              <span>选择封面</span>
            </v-btn>
            <div v-else @click="selectImage()" class="cover-preview">
              <img-card 
                :width="160" 
                :height="160" 
                :src="localData.coverLink"
                class="cover-image">
              </img-card>
              <div class="cover-overlay">
                <v-icon icon="mdi-pencil" size="20" color="white"></v-icon>
                <span>更换封面</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 板块标签 -->
      <div class="info-row">
        <div class="label-container">
          <span class="label-text">板块标签</span>
          <v-tooltip activator="parent" location="top">
            <div class="tooltip-content">
              <div class="tooltip-title">板块标签</div>
              <div class="tooltip-body">添加标签方便检索，使板块更容易被精确搜索。</div>
            </div>
          </v-tooltip>
          <v-icon icon="mdi-help-circle-outline" color="#8a8a8a" size="16" class="help-icon"></v-icon>
        </div>
        <div class="input-container">
          <div class="tags-container">
            <v-btn 
              :color="themeColor" 
              @click="setTagInputState(true)" 
              variant="tonal" 
              class="add-tag-btn">
              <v-icon icon="mdi-plus" size="18"></v-icon>
              <span>添加标签</span>
            </v-btn>
            <v-btn 
              v-for="(tag, index) in localData.tags" 
              :key="index" 
              :color="themeColor" 
              variant="tonal"
              class="tag-btn">
              {{ tag }}
              <v-btn 
                @click.stop="deleteTag(tag)" 
                icon 
                size="x-small" 
                variant="text"
                class="delete-tag-btn">
                <v-icon icon="mdi-close" size="14"></v-icon>
              </v-btn>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { globalProperties } from '@/main';
import { computed, defineAsyncComponent, ref } from 'vue';
import { getNormalWarnAlert } from '@/utils/other';
import { compressImage } from '@/utils/imageUtils';

export default {
  name: 'SectionInfoEditor',
  props: {
    initData: {
      type: Object,
      default: function () {
        return {
          articleSection: '',
          summary: '',
          tags: [],
          coverLink: '',
        }
      },
    },
  },
  setup() {
    const themeColor = globalProperties.$themeColor;
    const inputingTag = ref('');
    const ifShowTagInput = ref(false);
    const ifShowTagDialog = computed(() => {
      return ifShowTagInput.value;
    });
    const setTagInputState = (state) => {
      ifShowTagInput.value = state;
    };
    
        // 板块名称验证规则
        const sectionRules = [
            (v) => !!v || '板块名称不能为空',
            (v) => (v && v !== 'default') || '板块名称不能为 "default"',
            (v) => (v && v.length >= 2) || '板块名称至少需要2个字符',
            (v) => (v && v.length <= 50) || '板块名称不能超过50个字符',
            (v) => {
                if (!v) return true;
                const validPattern = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/;
                return validPattern.test(v) || '板块名称只能包含中文、英文、数字、下划线和连字符';
            }
        ];
    
    return {
      themeColor,
      inputingTag,
      ifShowTagDialog,
      ifShowTagInput,
      setTagInputState,
      sectionRules,
    }
  },
  components: {
    SensitiveTextArea: defineAsyncComponent(() => import('@/components/common/SensitiveTextArea.vue')),
    SensitiveTextField: defineAsyncComponent(() => import('@/components/common/SensitiveTextField.vue')),
    ImgCard: defineAsyncComponent(() => import('@/components/common/ImgCard.vue')),
  },
  data() {
    let data = this.initData ? JSON.parse(JSON.stringify(this.initData)) : {
      articleSection: '',
      summary: '',
      tags: [],
      coverLink: '',
    };
    // 如果从后端加载的数据是 'default'，则清空（编辑模式下）
    if (data.articleSection === 'default') {
      data.articleSection = '';
    }
    return {
      localData: data,
      tmpCoverImage: null,
    }
  },
  watch: {
    initData: {
      handler(newVal) {
        if (newVal) {
          this.localData = {
            articleSection: (newVal.articleSection && newVal.articleSection !== 'default') ? newVal.articleSection : '',
            summary: newVal.summary || '',
            tags: Array.isArray(newVal.tags) ? [...newVal.tags] : [],
            coverLink: newVal.coverLink || '',
          };
        }
      },
      deep: true,
      immediate: false,
    }
  },
  methods: {
    handleDataChange() {
      this.$emit('update:data', this.localData);
    },
    async selectImage() {
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg, image/png, image/gif';
      input.onchange = async (event) => {
        let image = event.target.files[0];
        if (!image) return;
        try {
          image = await compressImage(image, 1024 * 4);
          this.localData.coverLink = URL.createObjectURL(image);
          this.tmpCoverImage = image;
          this.handleDataChange();
        } catch (error) {
          console.error('Failed to compress image:', error);
          this.$emit('alert', { 
            state: true, 
            color: 'error', 
            title: '图片处理失败', 
            content: error.message || '图片压缩失败，请重试' 
          });
        }
      };
      input.click();
    },
    addTag() {
      if (!this.localData.tags) {
        this.localData.tags = [];
      }
      if (this.inputingTag === '') {
        this.$emit('alert', getNormalWarnAlert('标签不能为空'));
        return;
      }
      if (this.inputingTag.length > 15) {
        this.$emit('alert', getNormalWarnAlert('标签长度不能超过15个字符'));
        return;
      }
      const validTagPattern = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
      if (!validTagPattern.test(this.inputingTag)) {
        this.$emit('alert', {
          state: true,
          title: '标签只能包含中文、英文以及数字',
          content: '',
          color: 'warning'
        });
        return;
      }
      if (this.localData.tags.includes(this.inputingTag)) {
        this.$emit('alert', {
          state: true,
          title: '不可以添加重复的标签',
          content: '',
          color: 'warning'
        });
        return;
      }
      if (this.localData.tags.length >= 10) {
        this.$emit('alert', {
          state: true,
          title: '最多可添加 10 个标签',
          content: '',
          color: 'warning'
        });
        return;
      }
      this.localData.tags.push(this.inputingTag);
      this.inputingTag = '';
      this.ifShowTagInput = false;
      this.handleDataChange();
    },
    deleteTag(text) {
      this.localData.tags = this.localData.tags.filter(tag => tag !== text);
      this.handleDataChange();
    },
    async getDataForUpload() {
      return {
        data: this.localData,
        tmpCoverImage: this.tmpCoverImage,
      };
    },
  },
  emits: ['update:data', 'alert'],
}
</script>

<style scoped>
.section-info-editor {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.label-container {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  padding-top: 8px;
}

.label-text {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.help-icon {
  cursor: help;
}

.input-container {
  flex: 1;
  min-width: 0;
}

.cover-upload-container {
  display: flex;
  align-items: flex-start;
}

.cover-upload-btn {
  width: 160px;
  height: 160px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.cover-preview {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image {
  border-radius: 8px;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-preview:hover .cover-overlay,
.cover-preview:active .cover-overlay {
  opacity: 1;
}

@media (hover: none) {
  .cover-preview .cover-overlay {
    opacity: 0.3;
  }
  
  .cover-preview:active .cover-overlay {
    opacity: 0.7;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
}

.tag-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
}

.delete-tag-btn {
  margin-left: 4px;
  opacity: 0.7;
}

.delete-tag-btn:hover {
  opacity: 1;
}

.tooltip-content {
  max-width: 280px;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.tooltip-body {
  font-size: 13px;
  line-height: 1.5;
  color: #666;
}

.dialog-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 300px;
}

.dialog-bottom-btn-bar {
  padding: 10px 0 0 0;
  display: flex;
  flex-direction: row-reverse;
  gap: 12px;
}

.title-bold {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

@media screen and (max-width: 1000px) {
  .section-info-editor {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 0;
  }
  
  .info-section {
    gap: 20px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .label-container {
    min-width: auto;
    padding-top: 0;
    width: 100%;
  }
  
  .label-text {
    font-size: 13px;
  }
  
  .input-container {
    width: 100%;
  }
  
  .cover-upload-container {
    width: 100%;
  }
  
  .cover-upload-btn {
    width: 100%;
    max-width: 200px;
    height: 160px;
  }
  
  .cover-preview {
    width: 100%;
    max-width: 200px;
  }
  
  .cover-preview :deep(.cover-image) {
    width: 100% !important;
    height: 160px !important;
    max-width: 200px;
  }
  
  .tags-container {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .add-tag-btn,
  .tag-btn {
    font-size: 13px;
    height: 30px;
    padding: 0 10px;
  }
  
  .dialog-card {
    min-width: 280px;
    max-width: 90vw;
  }
}
</style>

