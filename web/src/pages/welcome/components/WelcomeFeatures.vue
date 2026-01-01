<template>
  <div :class="cardClass">
    <div class="section-title-small">核心功能</div>
    <div class="features-grid">
      <div class="feature-item">
        <v-icon color="primary" size="40">mdi-book-open-variant</v-icon>
        <div class="feature-title">文章资源分享</div>
        <div class="feature-desc">分享学习笔记、经验总结与优质资源</div>
      </div>
      <div class="feature-item">
        <v-icon color="primary" size="40">mdi-forum</v-icon>
        <div class="feature-title">帖子论坛社区</div>
        <div class="feature-desc">校园话题讨论，互动交流平台</div>
      </div>
      <div class="feature-item">
        <v-icon color="primary" size="40">mdi-school</v-icon>
        <div class="feature-title">课程评价参考</div>
        <div class="feature-desc">真实课程评价，选课参考指南</div>
      </div>
      <div class="feature-item">
        <v-icon color="primary" size="40">mdi-apps</v-icon>
        <div class="feature-title">个性化微服务</div>
        <div class="feature-desc">学生开发者创建的便捷校园服务</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cardClass: {
    type: String,
    default: 'features-section',
  },
});
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin: 40px 0;
  padding: 0 15px;
}

.feature-item {
  text-align: center;
  padding: 32px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
              0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.feature-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.feature-item:hover::before {
  left: 100%;
}

.feature-item:hover {
  transform: translateY(-8px) scale(1.02);
  background: linear-gradient(135deg, var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1)) 0%, var(--welcome-theme-rgba-10, rgba(118, 75, 162, 0.1)) 100%);
  box-shadow: 0 12px 40px var(--welcome-theme-rgba-25, rgba(102, 126, 234, 0.25)),
              0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--welcome-theme-rgba-30, rgba(102, 126, 234, 0.3));
}

.feature-item .v-icon {
  transition: transform 0.3s ease;
}

.feature-item:hover .v-icon {
  transform: scale(1.15) rotate(5deg);
}

.feature-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 16px 0 10px;
  color: #1a202c;
  letter-spacing: -0.3px;
}

.feature-desc {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
}

.section-title-small {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: -0.3px;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-section {
  width: 100%;
}

.features-section-card {
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.features-section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.06);
}

@media screen and (min-width: 1000px) {
  .features-section-card {
    padding: 45px;
  }

  .features-section-card .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 30px;
  }

  .features-section-card .feature-item {
    padding: 28px 20px;
  }

  .features-section-card .feature-item .v-icon {
    font-size: 42px !important;
  }

  .section-title-small {
    font-size: 1.8rem;
    margin-bottom: 24px;
  }
}

@media screen and (max-width: 1000px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 30px 0;
    padding: 0 8px;
  }

  .feature-item {
    padding: 24px 14px;
    border-radius: 16px;
  }

  .feature-item .v-icon {
    font-size: 36px !important;
  }

  .feature-title {
    font-size: 1.05rem;
    margin: 14px 0 8px;
  }

  .feature-desc {
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
</style>

