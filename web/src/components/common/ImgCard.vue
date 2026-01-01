<template>
  <v-dialog 
    v-model="ifShowDialog"
    class="image-viewer-dialog"
    fullscreen
    transition="fade-transition"
    scrim="rgba(0, 0, 0, 0.8)"
    @click:outside="setImgDetailState(false)">
    <div v-if="ifShowImgDetail" class="image-viewer-container" @click.stop>
      <div class="image-viewer-content">
        <!-- 加载中视图 -->
        <div v-if="imageLoading" class="image-loading-wrapper">
          <div class="loading-content">
            <v-progress-circular 
              :color="themeColor" 
              indeterminate
              size="64"
              width="6"
              class="loading-spinner">
            </v-progress-circular>
            <p class="loading-text">加载中...</p>
          </div>
        </div>
        
        <!-- 图片显示区域 -->
        <transition name="image-fade">
          <div v-if="!imageLoading" class="image-wrapper">
            <v-img 
              class="img-big" 
              :src="imgUrl || src"
              contain
              @load="onImageLoad"
              @error="onImageError">
              <template v-slot:placeholder>
                <div class="image-placeholder">
                  <v-progress-circular 
                    :color="themeColor" 
                    indeterminate
                    size="48">
                  </v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>
        </transition>
        
        <!-- 工具栏 -->
        <transition name="toolbar-slide">
          <div v-if="!imageLoading" style="width: 100%;height: 50px;display: flex;align-items: center;justify-content: center;">
          <v-btn style="margin-bottom: 0px;margin-right: 50px;" icon @click="setImgDetailState(false)">
            <v-icon :color="themeColor" :size="25" :icon="'mdi-close'"></v-icon>
            <v-tooltip activator="parent">关闭</v-tooltip>
          </v-btn>
          <v-btn style="margin-bottom: 0px;" icon @click="saveImage">
            <v-icon :color="themeColor" :size="25" :icon="'mdi-tray-arrow-down'"></v-icon>
            <v-tooltip activator="parent">保存此图片</v-tooltip>
          </v-btn>
        </div>
        </transition>
      </div>
    </div>
  </v-dialog>
  <div class="img-card-container">
    <v-img @click.stop="imgClick" :lazy-src="lazyImgUrl" :min-height="height" :max-height="height" cover
      :src="ifNeedDeal ? imgUrl : src" :max-width="width" :min-width="width">
      <template v-slot:placeholder>
        <v-row align="center" class="fill-height ma-0" justify="center">
          <v-progress-circular :color="themeColor" indeterminate></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-btn v-if="editable" icon @click="deleteSelf" size="20" text="✕" :color="themeColor" variant="tonal"
      class="close-btn">
    </v-btn>
  </div>
</template>

<script>
import { globalProperties } from '@/main';
import { globalImageCacher } from '@/utils/global_img_cache';
import { fetchImgAndDeal } from '@/utils/imageUtils';
import { computed, ref, nextTick } from 'vue';

export default {
  name: 'ImgCard',
  props: {
    src: {
      type: String,
      default: null
    },
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: null
    },
    editable: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: true
    },
    ifNeedDeal: {
      type: Boolean,
      default: true
    },
  },
  setup() {
    const themeColor = globalProperties.$themeColor;
    const lazyImgUrl = globalProperties.$imgLazy;
    const ifShowImgDetail = ref(false);
    const imageLoading = ref(false);
    const ifShowDialog = computed(() => {
      return ifShowImgDetail.value;
    })
    const setImgDetailState = (state) => {
      ifShowImgDetail.value = state;
      if (state) {
        // 打开对话框时重置加载状态
        imageLoading.value = true;
      } else {
        imageLoading.value = false;
      }
    }
    
    // 图片加载完成
    const onImageLoad = () => {
      imageLoading.value = false;
    }
    
    // 图片加载错误
    const onImageError = () => {
      imageLoading.value = false;
    }
    
    return {
      lazyImgUrl,
      ifShowDialog,
      ifShowImgDetail,
      setImgDetailState,
      themeColor,
      imageLoading,
      onImageLoad,
      onImageError,
    }
  },
  data() {
    return {
      loadState: false,
      imgBlob: null,
      imgUrl: this.src,
    }
  },
  watch: {
    ifShowImgDetail: {
      handler(newVal) {
        if (newVal) {
          // 当对话框打开时，检查图片是否已加载
          nextTick(() => {
            this.checkImageLoaded();
          });
        }
      },
      immediate: false,
    },
    src: {
      //eslint-disable-next-line
      async handler(newValue, oldValue) {
        if (this.ifNeedDeal) {
          /**
           * try get from the cache first  
           */
          if (globalImageCacher.getImage(newValue)) {
            this.imgUrl = globalImageCacher.getImage(newValue);
            return;
          }
          try {
            this.imgUrl = await fetchImgAndDeal(newValue);
            globalImageCacher.addImage(newValue, this.imgUrl);
          } catch (error) {
            console.error('Failed to fetch and process image:', error);
            // 使用原始 URL 作为后备方案
            this.imgUrl = newValue;
          }
        }
      },
      immdiate: false,
    }
  },
  methods: {
    deleteSelf() {
      this.$emit('delete_img', this.src);
    },
    imgClick() {
      if (this.clickable) {
        this.setImgDetailState(true);
      }else{
        //点击父级元素
        this.$emit('click');
      }
    },
    saveImage() {
      const link = document.createElement('a');
      link.href = this.imgUrl;
      link.download = Date.now().toString() + '.jpeg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    checkImageLoaded() {
      // 检查图片是否已经在浏览器缓存中
      const imageUrl = this.imgUrl || this.src;
      if (!imageUrl) {
        this.imageLoading = false;
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // 图片已加载，延迟一点显示以展示加载动画
        setTimeout(() => {
          this.imageLoading = false;
        }, 300);
      };
      img.onerror = () => {
        this.imageLoading = false;
      };
      img.src = imageUrl;
    },
  },
  async mounted() {
    if (this.ifNeedDeal) {
      /**
       * try get from the cache first  
       */
      if (globalImageCacher.getImage(this.imgUrl)) {
        this.imgUrl = globalImageCacher.getImage(this.imgUrl);
        this.loadState = true;
        return;
      }
      try {
        let tmp = await fetchImgAndDeal(this.imgUrl);
        globalImageCacher.addImage(this.imgUrl, tmp);
        this.imgUrl = tmp;
      } catch (error) {
        console.error('Failed to fetch and process image:', error);
        // 使用原始 URL 作为后备方案
        this.imgUrl = this.src;
      }
    }
    this.loadState = true;
  }
}
</script>

<style scoped>
.img-card-container {
  position: relative;
  margin: 1px;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

/* ========== 图片查看器对话框样式 ========== */
.image-viewer-dialog :deep(.v-overlay__content) {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
}

.image-viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.image-viewer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

/* ========== 加载中视图 ========== */
.image-loading-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.loading-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
}

/* ========== 图片显示区域 ========== */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.img-big {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 24px rgba(0, 0, 0, 0.2);
  object-fit: contain;
}

/* ========== 工具栏 ========== */
.image-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.toolbar-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toolbar-btn:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.toolbar-btn:active {
  transform: translateY(0) scale(1);
}

.close-btn {
  background: rgba(244, 67, 54, 0.9) !important;
}

.close-btn:hover {
  background: rgba(244, 67, 54, 1) !important;
}

.save-btn {
  background: rgba(76, 175, 80, 0.9) !important;
}

.save-btn:hover {
  background: rgba(76, 175, 80, 1) !important;
}

/* ========== 动画效果 ========== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 图片淡入动画 */
.image-fade-enter-active {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.image-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.image-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* 工具栏滑入动画 */
.toolbar-slide-enter-active {
  transition: opacity 0.4s ease-out 0.2s, transform 0.4s ease-out 0.2s;
}

.toolbar-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toolbar-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* ========== 移动端适配 ========== */
@media screen and (max-width: 1000px) {
  .image-viewer-container {
    padding: 12px;
  }

  .img-big {
    max-width: 95vw;
    max-height: 80vh;
    border-radius: 8px;
  }

  .loading-content {
    padding: 32px 24px;
    border-radius: 16px;
    gap: 20px;
  }

  .loading-spinner {
    width: 48px !important;
    height: 48px !important;
  }

  .loading-text {
    font-size: 14px;
  }

  .image-toolbar {
    gap: 20px;
    margin-top: 16px;
    padding: 12px 20px;
    border-radius: 40px;
  }

  .toolbar-btn {
    width: 48px;
    height: 48px;
  }

  .toolbar-btn :deep(.v-icon) {
    font-size: 24px !important;
  }
}

/* ========== PC端优化 ========== */
@media screen and (min-width: 1000px) {
  .image-viewer-container {
    padding: 40px;
  }

  .img-big {
    max-width: 90vw;
    max-height: 85vh;
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3),
                0 12px 32px rgba(0, 0, 0, 0.2);
  }

  .loading-content {
    padding: 48px 40px;
    border-radius: 24px;
    gap: 28px;
  }

  .loading-spinner {
    width: 64px !important;
    height: 64px !important;
  }

  .loading-text {
    font-size: 18px;
  }

  .image-toolbar {
    gap: 32px;
    margin-top: 32px;
    padding: 20px 32px;
  }

  .toolbar-btn {
    width: 56px;
    height: 56px;
  }

  .toolbar-btn :deep(.v-icon) {
    font-size: 28px !important;
  }
}
</style>