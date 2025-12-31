<template>
  <!-- 底部栏模式（移动端） -->
  <div v-if="mode === 'bottom'" class="bottom-bar">
    <div class="column-center user-name text-medium">{{ userName }}</div>
    <v-spacer class="spacer"></v-spacer>
    <div class="row-reverse">
      <!-- 管理员按钮 -->
      <div v-if="ifMaster && !ifMobile" class="column-center padding-right-5px">
        <manage-button :id="section.id" :type="'article'" size="23" />
      </div>
      
      <!-- 举报按钮 -->
      <div v-if="userId != section.authorId && !ifMobile" class="column-center padding-right-5px">
        <alert-button :id="section.id" :type="'article'" />
      </div>
      
      <!-- 编辑按钮（只有版主可以编辑） -->
      <div v-if="userId == section.authorId && !ifMobile" class="column-center padding-right-5px">
        <v-btn elevation="0" @click="$emit('edit')" icon class="bottom-btn">
          <v-icon icon="mdi-pencil-outline" size="23"></v-icon>
          <v-tooltip activator="parent">编辑板块</v-tooltip>
        </v-btn>
      </div>
      
      <!-- 发布帖子按钮 -->
      <div class="column-center padding-right-10px">
        <v-btn elevation="0" @click="$emit('publish-post')" icon class="bottom-btn">
          <v-icon icon="mdi-plus-circle-outline" size="23"></v-icon>
          <v-tooltip activator="parent">发布帖子</v-tooltip>
        </v-btn>
      </div>
      
      <!-- 收藏按钮 -->
      <div class="column-center padding-right-10px">
        <star-button
          v-if="section.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :type="'article'"
          :id="section.id"
          :state="section.ifStar"
        />
      </div>
      
      <!-- 点赞按钮 -->
      <div class="column-center padding-right-5px">
        <like-button
          v-if="section.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :id="section.id"
          :type="'article'"
          :state="section.ifLike"
        />
      </div>
    </div>
  </div>
  
  <!-- 侧边栏模式（PC端） -->
  <div v-else class="sidebar-bar">
    <v-card class="sidebar-card">
      <div class="sidebar-header">
        <avatar-name :init-data="{ id: userId, name: userName }" />
      </div>
      <v-divider></v-divider>
      <div class="sidebar-content">
        <!-- 发布帖子按钮 -->
        <v-btn
          @click="$emit('publish-post')"
          variant="tonal"
          :color="themeColor"
          block
          size="large"
          prepend-icon="mdi-plus-circle-outline"
          class="action-btn"
        >
          发布帖子
        </v-btn>
        
        <!-- 编辑按钮（只有版主可以编辑） -->
        <v-btn
          v-if="userId == section.authorId"
          @click="$emit('edit')"
          variant="outlined"
          :color="themeColor"
          block
          size="large"
          prepend-icon="mdi-pencil-outline"
          class="action-btn"
        >
          编辑板块
        </v-btn>
        
        <v-divider class="action-divider"></v-divider>
        
        <!-- 点赞和收藏 -->
        <div class="action-group">
          <div class="action-item">
            <like-button
              v-if="section.id"
              @alert="$emit('alert', $event)"
              @set_loading="$emit('set-loading', $event)"
              :id="section.id"
              :type="'article'"
              :state="section.ifLike"
            />
            <span class="action-label">点赞</span>
          </div>
          
          <div class="action-item">
            <star-button
              v-if="section.id"
              @alert="$emit('alert', $event)"
              @set_loading="$emit('set-loading', $event)"
              :type="'article'"
              :id="section.id"
              :state="section.ifStar"
            />
            <span class="action-label">收藏</span>
          </div>
        </div>
        
        <v-divider class="action-divider"></v-divider>
        
        <!-- 管理员和举报 -->
        <div v-if="ifMaster" class="action-item">
          <manage-button :id="section.id" :type="'article'" size="24" />
          <span class="action-label">管理</span>
        </div>
        
        <div v-if="userId != section.authorId" class="action-item">
          <alert-button :id="section.id" :type="'article'" />
          <span class="action-label">举报</span>
        </div>
        
        <!-- 删除按钮（只有版主可以删除，放在最下面） -->
        <div v-if="userId == section.authorId" class="action-item">
          <delete-button
            @delete="$emit('delete')"
            :id="section.id"
            :type="'article'"
            :size="24"
            @alert="$emit('alert', $event)"
            @set_loading="$emit('set-loading', $event)"
          />
          <span class="action-label">删除板块</span>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import ManageButton from '@/components/manage/ManageButton.vue';
import AlertButton from '@/components/report/AlertButton.vue';
import StarButton from '@/components/star/StarButton.vue';
import LikeButton from '@/components/common/LikeButton.vue';
import DeleteButton from '@/components/common/DeleteButton.vue';
import { getDeviceType } from '@/utils/device';
import { globalProperties } from '@/main';
import AvatarName from '@/components/common/AvatarName';
defineProps({
  section: {
    type: Object,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'bottom', // 'bottom' 或 'sidebar'
  },
});

const ifMobile = getDeviceType() === 'mobile';
const themeColor = globalProperties.$themeColor;

defineEmits(['edit', 'publish-post', 'delete', 'alert', 'set-loading']);
</script>

<style scoped>
.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.padding-right-5px {
  padding-right: 5px;
}

.padding-right-10px {
  padding-right: 10px;
}

.bottom-btn {
  width: 23px;
  height: 23px;
  color: #8a8a8a;
  background-color: rgba(0, 0, 0, 0);
}

@media screen and (min-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 1000px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }

  .user-name {
    margin-left: 10px;
    max-width: 300px;
    color: var(--theme-color);
  }

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
  }
}

@media screen and (max-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 100vw;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }

  .user-name {
    margin-left: 2vw;
    width: 30vw;
    color: var(--theme-color);
  }

  .spacer {
    max-width: 30vw;
    font-size: 0px;
  }

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
    width: 40vw;
  }
}

/* 侧边栏模式样式（PC端） */
.sidebar-bar {
  width: 250px;
  flex-shrink: 0;
}

.sidebar-card {
  position: sticky;
  top: 20px;
}

.sidebar-header {
  padding: 16px 20px;
  background-color: rgba(0, 0, 0, 0.02);
}

.sidebar-title {
  font-weight: 600;
  color: #333;
}

.sidebar-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  margin-bottom: 4px;
}

.action-divider {
  margin: 8px 0;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.action-label {
  font-size: 14px;
  color: #666;
  flex: 1;
}

@media screen and (max-width: 1000px) {
  .sidebar-bar {
    display: none;
  }
}
</style>

