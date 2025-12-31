<template>
  <div class="section-introduction">
    <div class="intro-header">
      <v-icon icon="mdi-forum" :color="themeColor" size="28"></v-icon>
      <h2 class="intro-title">板块文章编辑</h2>
    </div>
    <div class="intro-content">
      <p class="intro-text">
        板块文章类似于论坛中的板块，用于创建和管理特定主题的讨论区。
        当发布为板块文章后，其他用户可以在该板块下发布帖子进行讨论。<br />
        板块可以被设计为一个主题的讨论区，也可以被设计为一个团体的通知/活动等发布区，通过编辑板块信息以介绍你的板块究竟是用来做什么的
      </p>
      <div class="intro-features">
        <div class="feature-item">
          <v-icon icon="mdi-account-group" :color="themeColor" size="20"></v-icon>
          <span>社区讨论</span>
        </div>
        <div class="feature-item">
          <v-icon icon="mdi-tag-multiple" :color="themeColor" size="20"></v-icon>
          <span>主题分类</span>
        </div>
        <div class="feature-item">
          <v-icon icon="mdi-message-text" :color="themeColor" size="20"></v-icon>
          <span>内容交流</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  themeColor: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.section-introduction {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.03) 100%);
  border-left: 4px solid var(--theme-color, #1976d2);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.intro-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.intro-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.intro-text {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.intro-features {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

@media screen and (max-width: 1000px) {
  .section-introduction {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 0;
    border-left: none;
    border-top: 3px solid var(--theme-color, #1976d2);
  }
  
  .intro-header {
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .intro-title {
    font-size: 18px;
  }
  
  .intro-content {
    gap: 14px;
  }
  
  .intro-text {
    font-size: 13px;
    line-height: 1.5;
  }
  
  .intro-features {
    gap: 16px;
    flex-direction: column;
  }
  
  .feature-item {
    font-size: 13px;
  }
  
  .intro-header :deep(.v-icon) {
    font-size: 24px !important;
  }
  
  .feature-item :deep(.v-icon) {
    font-size: 18px !important;
  }
}
</style>

