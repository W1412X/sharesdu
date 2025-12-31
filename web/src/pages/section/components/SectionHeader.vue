<template>
  <part-loading-view
    :state="!loadState"
    class="top-bar"
    :text="'正在加载板块信息...'"
  ></part-loading-view>
  <div v-if="loadState" class="top-bar section-content">
    <!--
    <v-chip
      v-if="section.ifTop && !ifMaster"
      width="100%"
      variant="tonal"
      :color="themeColor"
      style="border-radius: 0px; max-height: 28px; width: 100%; justify-content: center;"
    >
      <v-icon size="20">mdi-format-vertical-align-top</v-icon>
      <span style="margin-left: 10px;" class="text-small-bold">置顶板块</span>
      <v-tooltip activator="parent">此板块为网站置顶板块</v-tooltip>
    </v-chip>
    <v-btn
      v-if="ifMaster"
      @click="$emit('set-section-top')"
      :loading="loading.top"
      :disabled="loading.top"
      width="100%"
      variant="tonal"
      :color="section.ifTop ? 'grey' : themeColor"
      style="max-height: 28px; width: 100%; justify-content: center;"
    >
      <v-icon size="20">mdi-format-vertical-align-top</v-icon>
      <span style="margin-left: 10px;" class="text-small-bold">
        {{ section.ifTop ? '取消置顶' : '置顶此板块' }}
      </span>
      <v-tooltip activator="parent">作为管理员，您可以设置是否置顶此板块</v-tooltip>
    </v-btn>
    置顶提示 -->
    <!-- 板块头部主要内容 -->
    <div class="section-header-main">
      <!-- 封面图片 -->
      <div class="section-cover-container" v-if="section.coverLink">
        <img-card
          :src="section.coverLink"
          :width="coverSize"
          :height="coverSize"
          :clickable="false"
          cover
          aspect-ratio="1/1"
          class="section-cover"
        ></img-card>
      </div>
      
      <!-- 板块信息 -->
      <div class="section-info">
        <!-- 板块标题 -->
        <div class="title-row">
          <div v-if="section.sectionName" class="section-title-container">
            <v-icon icon="mdi-bulletin-board" :size="deviceType === 'mobile' ? 20 : 24" :color="themeColor" class="section-icon"></v-icon>
            <h1 class="text-big-title-bold" :style="{ color: themeColor }">{{ section.sectionName }}</h1>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="showDetailDialog = true"
            class="more-btn"
          >
            <v-icon icon="mdi-information-variant-circle-outline" :size="deviceType === 'mobile' ? 20 : 24"></v-icon>
            <v-tooltip activator="parent">查看详细介绍</v-tooltip>
          </v-btn>
        </div>
        
        <!-- 板块描述 -->
        <div v-if="section.summary" class="section-summary">
          {{ section.summary }}
        </div>
        
        <!-- 创建时间 -->
        <div class="meta-item">
          <v-icon icon="mdi-clock-outline" size="16" color="#8a8a8a"></v-icon>
          <span class="text-small grey-font">{{ formattedPublishTime }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 详细介绍弹窗 - 移动端从底部弹出，PC端从右侧弹出 -->
  <!-- 移动端：底部弹出 -->
  <v-bottom-sheet v-if="deviceType === 'mobile'" v-model="showDetailDialog" class="detail-sheet">
    <v-sheet class="detail-sheet-content">
      <div class="detail-header">
        <div class="detail-title text-title-bold">{{ section.sectionName || '板块详情' }}</div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="showDetailDialog = false"
        >
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </div>
      <div class="detail-body">
        <!-- 板块信息 -->
        <div class="detail-info-section">
          <!-- 版主 -->
          <div v-if="section.authorId" class="detail-info-item">
            <span class="detail-info-label">版主：</span>
            <avatar-name
              :init-data="{ id: section.authorId, name: section.authorName }"
              class="author-name"
            />
          </div>
          
          <!-- 板块名称 -->
          <div v-if="section.sectionName" class="detail-info-item">
            <span class="detail-info-label">板块名称：</span>
            <span class="detail-info-value">{{ section.sectionName }}</span>
          </div>
          
          <!-- 摘要 -->
          <div v-if="section.summary" class="detail-info-item">
            <span class="detail-info-label">摘要：</span>
            <span class="detail-info-value">{{ section.summary }}</span>
          </div>
          
          <!-- 标签 -->
          <div v-if="section.tags && section.tags.length > 0" class="detail-info-item">
            <span class="detail-info-label">标签：</span>
            <div class="detail-tags">
              <tag-button
                v-for="(tag, index) in section.tags"
                :key="index"
                :data="tag"
              />
            </div>
          </div>
        </div>
        
        <v-divider class="detail-divider"></v-divider>
        
        <!-- 详细内容 -->
        <div class="detail-content-wrapper">
          <article-display
            :init-data="detailContent"
            class="detail-content"
          ></article-display>
        </div>
      </div>
    </v-sheet>
  </v-bottom-sheet>
  
  <!-- PC端：右侧弹出 -->
  <v-overlay v-else :model-value="showDetailDialog" @update:model-value="showDetailDialog = $event" class="detail-overlay">
    <div class="detail-container-pc">
      <div class="detail-header-pc">
        <div class="detail-title-pc text-title-bold">{{ section.sectionName || '板块详情' }}</div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="showDetailDialog = false"
        >
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </div>
      <div class="detail-body-pc">
        <!-- 板块信息 -->
        <div class="detail-info-section">
          <!-- 版主 -->
          <div v-if="section.authorId" class="detail-info-item">
            <span class="detail-info-label">版主：</span>
            <avatar-name
              :init-data="{ id: section.authorId, name: section.authorName }"
              class="author-name"
            />
          </div>
          
          <!-- 板块名称 -->
          <div v-if="section.sectionName" class="detail-info-item">
            <span class="detail-info-label">板块名称：</span>
            <span class="detail-info-value">{{ section.sectionName }}</span>
          </div>
          
          <!-- 摘要 -->
          <div v-if="section.summary" class="detail-info-item">
            <span class="detail-info-label">摘要：</span>
            <span class="detail-info-value">{{ section.summary }}</span>
          </div>
          
          <!-- 标签 -->
          <div v-if="section.tags && section.tags.length > 0" class="detail-info-item">
            <span class="detail-info-label">标签：</span>
            <div class="detail-tags">
              <tag-button
                v-for="(tag, index) in section.tags"
                :key="index"
                :data="tag"
              />
            </div>
          </div>
        </div>
        
        <v-divider class="detail-divider"></v-divider>
        
        <!-- 详细内容 -->
        <div class="detail-content-wrapper">
          <article-display
            :init-data="detailContent"
            class="detail-content-pc"
          ></article-display>
        </div>
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import { computed, ref } from 'vue';
import TagButton from '@/components/article/TagButton.vue';
import AvatarName from '@/components/common/AvatarName';
import { formatRelativeTime } from '@/utils/other';
import { defineAsyncComponent } from 'vue';
import ArticleDisplay from '@/components/article/ArticleDisplay.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import { getDeviceType } from '@/utils/device';

const ImgCard = defineAsyncComponent(() => import('@/components/common/ImgCard.vue'));

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Object,
    required: true,
  },
  loadState: {
    type: Boolean,
    default: false,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['set-section-top']);

const showDetailDialog = ref(false);
const deviceType = getDeviceType();

const formattedPublishTime = computed(() => {
  return formatRelativeTime(props.section.publishTime);
});

const detailContent = computed(() => {
  return {
    type: props.section.editorType || 'html',
    content: props.section.content || '',
  };
});

// 封面大小（响应式）
const coverSize = computed(() => {
  // 可以根据需要调整
  return deviceType === 'mobile' ? 80 : 100;
});
</script>

<style scoped>
.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header-main {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-start;
}

.section-cover-container {
  flex-shrink: 0;
}

.section-cover {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-info {
  flex: 1;
  display: flex;
  width: calc(100% - 120px);
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: -2px;
}

.section-title-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.section-icon {
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  white-space: normal;
  word-break: break-all;
  overflow: hidden;
  line-height: 1.3;
}

.more-btn {
  flex-shrink: 0;
  color: #8a8a8a;
}

.meta-row {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.grey-font {
  color: #8a8a8a;
}

.section-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  margin-top: -4px;
  margin-bottom: -2px;
}

/* 详情弹窗样式 - 移动端底部弹出 */
.detail-sheet-content {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 800px;
}

.detail-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.detail-title {
  flex: 1;
  margin-right: 16px;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.detail-content {
  width: 100%;
  border: none;
}

.detail-content :deep(.container) {
  width: 100%;
  border: none;
  padding: 0;
}

/* 详情弹窗样式 - PC端右侧弹出 */
.detail-overlay {
  padding: 0px;
  display: flex;
  flex-direction: row-reverse;
}

.detail-container-pc {
  background-color: #ffffff;
  border-top: #8a8a8a 1px solid;
  width: 752px;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.detail-header-pc {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.detail-title-pc {
  flex: 1;
  margin-right: 16px;
}

.detail-body-pc {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.detail-info-section {
  margin-bottom: 20px;
}

.detail-info-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.detail-info-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-info-value {
  color: #333;
  flex: 1;
  word-break: break-word;
}

.detail-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.author-name {
  color: var(--theme-color);
}

.detail-divider {
  margin: 16px 0;
}

.detail-content-wrapper {
  flex: 1;
  overflow-y: auto;
}

.detail-content-pc {
  width: 100%;
  border: none;
}

.detail-content-pc :deep(.container) {
  width: 100%;
  border: none;
  padding: 0;
}

@media screen and (min-width: 1000px) {
  .top-bar {
    border: grey 1px solid;
    width: 1000px;
    padding: 16px 20px;
  }
  
  .section-cover-container {
    width: 100px;
    height: 100px;
  }
}

@media screen and (max-width: 1000px) {
  .top-bar {
    border: grey 1px solid;
    width: 100vw;
    padding: 12px 16px;
  }
  
  .section-header-main {
    flex-direction: row;
    gap: 12px;
  }
  
  .section-cover-container {
    align-self: center;
    width: 80px;
    height: 80px;
  }
  
  .section-cover {
    width: 80px !important;
    height: 80px !important;
  }
  
  .section-badge-row {
    justify-content: center;
  }
  
  .section-badge-text {
    font-size: 12px;
  }
  
  .meta-row {
    justify-content: center;
  }
  
  .detail-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-info-label {
    min-width: auto;
  }
  
  .detail-sheet-content {
    height: 85vh;
  }
  
  .detail-header {
    padding: 12px 16px;
  }
  
  .detail-body {
    padding: 16px;
  }
}
</style>
