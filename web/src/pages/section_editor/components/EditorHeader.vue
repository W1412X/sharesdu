<template>
  <div class="editor-header section-editor-header">
    <!-- 板块编辑提示横幅 -->
    <div class="section-banner">
      <v-icon icon="mdi-forum" :color="themeColor" size="24"></v-icon>
      <span class="section-banner-text">板块文章编辑</span>
      <v-tooltip activator="parent" location="top" class="tool-tip">
        <div class="tooltip-content">
          <div class="tooltip-title">什么是板块文章？</div>
          <div class="tooltip-body">
            板块文章类似于论坛中的板块，用于创建和管理特定主题的讨论区。
            当发布为板块文章后，其他用户可以在该板块下发布帖子进行讨论。<br />
            板块可以被设计为一个主题的讨论区，也可以被设计为一个团体的通知/活动等发布区，通过编辑板块信息以介绍你的板块究竟是用来做什么的
          </div>
        </div>
      </v-tooltip>
      <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="18" class="help-icon"></v-icon>
    </div>
    
    <!-- 板块名称显示（替代标题编辑框） -->
    <div class="section-title-display">
      <div class="title-label">
        <v-icon icon="mdi-bulletin-board" :color="themeColor" size="20"></v-icon>
        <span class="label-text">板块名称：</span>
      </div>
      <div class="title-value" :style="{ color: themeColor }">
        {{ sectionName || '未设置板块名称' }}
      </div>
      <v-tooltip activator="parent" location="top">
        <div class="tooltip-content">
          <div class="tooltip-title">板块名称</div>
          <div class="tooltip-body">
            板块名称将作为文章标题，请在下方的编辑栏中设置板块名称。
          </div>
        </div>
      </v-tooltip>
    </div>
    
    <v-btn @click="$emit('shift-editor-type')" class="editor-type-btn" variant="tonal">
      {{ editorBtnText }}
    </v-btn>
  </div>
</template>

<script setup>
import { globalProperties } from '@/main';

defineProps({
  editorBtnText: {
    type: String,
    required: true,
  },
  sectionName: {
    type: String,
    default: '',
  },
  deviceType: {
    type: String,
    required: true,
  },
});

defineEmits(['shift-editor-type']);

const themeColor = globalProperties.$themeColor;
</script>

<style scoped>
.section-editor-header {
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 12px;
  border-left: 4px solid var(--theme-color, #1976d2);
  padding-left: 16px;
  margin-bottom: 10px;
}

.section-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-bottom: 1px solid rgba(25, 118, 210, 0.2);
  border-radius: 8px;
  margin-bottom: 8px;
}

.section-banner-text {
  font-weight: 600;
  color: var(--theme-color, #1976d2);
  font-size: 16px;
}

.help-icon {
  margin-left: auto;
  cursor: help;
}

.tooltip-content {
  max-width: 300px;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.tooltip-body {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

.section-title-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: rgba(25, 118, 210, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.title-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: fit-content;
}

.label-text {
  font-weight: 600;
  color: #666;
  font-size: 15px;
}

.title-value {
  flex: 1;
  font-weight: 600;
  font-size: 18px;
  word-break: break-word;
}

.editor-type-btn {
  width: 100%;
}

@media screen and (max-width: 1000px) {
  .section-editor-header {
    padding-left: 12px;
    gap: 10px;
  }
  
  .editor-type-btn {
    height: 30px;
  }
  
  .section-banner {
    padding: 10px 12px;
  }
  
  .section-banner-text {
    font-size: 14px;
  }
  
  .section-title-display {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .title-value {
    font-size: 16px;
    width: 100%;
  }
  
  .label-text {
    font-size: 14px;
  }
}
</style>


