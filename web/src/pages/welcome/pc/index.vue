<template>
  <div class="welcome-pc-container">
    <div class="main-content">
      <!-- Hero 区域 -->
      <WelcomeHero></WelcomeHero>
      
      <!-- 主要内容区域：左右分栏布局 -->
      <div class="main-grid">
        <!-- 左侧：功能展示 -->
        <WelcomeFeatures card-class="features-section-card"></WelcomeFeatures>
        
        <!-- 右侧：优势 -->
        <div class="right-column">
          <!-- 平台优势 -->
          <WelcomeAdvantages card-class="advantages-section-card"></WelcomeAdvantages>
        </div>
      </div>
      
      <!-- 提示信息区域 -->
      <WelcomeNotices></WelcomeNotices>
      
      <!-- 联系方式 -->
      <WelcomeContact></WelcomeContact>
    </div>
  </div>
</template>

<script setup>
import {
  WelcomeHero,
  WelcomeFeatures,
  WelcomeAdvantages,
  WelcomeNotices,
  WelcomeContact,
} from '../components';

defineOptions({
  name: 'WelcomePagePc',
});
</script>

<style scoped>
.welcome-pc-container {
  width: 100%;
  padding: 60px 40px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* 主网格布局 */
.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  margin: 50px 0;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
</style>

