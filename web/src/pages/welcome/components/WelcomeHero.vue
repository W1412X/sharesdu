<template>
  <div class="hero-section">
    <div class="hero-content">
      <div class="title-big-bold intro-text-div hero-title">ShareSDU</div>
      <div class="hero-subtitle">大学交流分享平台</div>
      <div class="title intro-text-div hero-description">
        为大学生活提供一个分享、交流与学习的平台
      </div>
      <!-- 注册按钮区域 -->
      <div class="hero-cta">
        <v-btn
          to="/login"
          size="x-large"
          prepend-icon="mdi-account-plus"
          color="primary"
          class="hero-register-btn"
          elevation="4">
          立即注册账号
        </v-btn>
        <div class="hero-cta-hint">开启你的 ShareSDU 之旅</div>
      </div>
      
      <!-- 开源和公益性项目信息 -->
      <div class="project-info">
        <div class="project-badge">
          <v-icon color="info" size="16" class="project-icon">mdi-heart</v-icon>
          <span class="project-text">公益性项目</span>
        </div>
        <div class="project-badge">
          <v-icon color="success" size="16" class="project-icon">mdi-github</v-icon>
          <span class="project-text">全面开源</span>
        </div>
        <div class="project-badge">
          <v-icon color="warning" size="16" class="project-icon">mdi-school</v-icon>
          <span class="project-text">面向山东大学</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Hero 组件不需要 props，只负责展示
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 60px 30px 50px;
  background: linear-gradient(135deg, 
    var(--welcome-theme-rgba-08, rgba(102, 126, 234, 0.08)) 0%, 
    var(--welcome-theme-rgba-08, rgba(118, 75, 162, 0.08)) 50%,
    var(--welcome-theme-rgba-08, rgba(33, 150, 243, 0.08)) 100%);
  border-radius: 24px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1)) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

.hero-title {
  font-size: 4.5rem !important;
  font-weight: 900 !important;
  background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-color, #764ba2) 50%, var(--welcome-theme-gradient-end, #f093fb) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px !important;
  line-height: 1.1;
  letter-spacing: -2px;
  position: relative;
  z-index: 1;
  animation: gradientShift 3s ease infinite;
  background-size: 200% 200%;
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.hero-description {
  font-size: 1.25rem;
  color: #4a5568;
  max-width: 680px;
  margin: 0 auto 32px;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

.hero-cta {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.hero-register-btn {
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  padding: 18px 48px !important;
  letter-spacing: 0.5px;
  text-transform: none !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-color, #764ba2) 100%) !important;
  box-shadow: 0 8px 24px var(--welcome-theme-rgba-40, rgba(102, 126, 234, 0.4)),
              0 4px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
  line-height: 1.5 !important;
  min-height: auto !important;
  height: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.hero-register-btn :deep(.v-btn__content) {
  position: relative;
  z-index: 2;
  white-space: nowrap;
  overflow: visible;
}

.hero-register-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  z-index: 1;
  pointer-events: none;
}

.hero-register-btn:hover::before {
  width: 300px;
  height: 300px;
}

.hero-register-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px var(--welcome-theme-rgba-50, rgba(102, 126, 234, 0.5)),
              0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.hero-register-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.hero-cta-hint {
  font-size: 1rem;
  color: #718096;
  font-style: italic;
  opacity: 0.8;
}

.project-info {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.project-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.project-icon {
  flex-shrink: 0;
}

.project-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
}

.intro-text-div {
  margin-top: 8px;
  width: fit-content;
  justify-self: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (min-width: 1000px) {
  .hero-section {
    padding: 80px 60px 70px;
    margin-bottom: 60px;
    max-width: 100%;
    border-radius: 24px;
  }

  .hero-title {
    font-size: 5.5rem !important;
    margin-bottom: 20px !important;
  }

  .hero-subtitle {
    font-size: 2.4rem;
    margin-bottom: 24px;
  }

  .hero-description {
    font-size: 1.35rem;
    max-width: 720px;
    margin-bottom: 40px;
  }

  .hero-cta {
    margin-top: 12px;
    gap: 16px;
  }

  .hero-register-btn {
    font-size: 1.4rem !important;
    padding: 22px 64px !important;
  }

  .hero-cta-hint {
    font-size: 1.05rem;
  }
  
  .project-info {
    margin-top: 32px;
    gap: 24px;
  }
  
  .project-badge {
    padding: 8px 16px;
  }
  
  .project-text {
    font-size: 1rem;
  }
}

@media screen and (max-width: 1000px) {
  .hero-section {
    padding: 40px 20px 35px;
    margin-bottom: 30px;
    border-radius: 20px;
  }

  .hero-title {
    font-size: 2.8rem !important;
    line-height: 1.1;
    margin-bottom: 16px !important;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  .hero-description {
    font-size: 1rem;
    padding: 0 8px;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .hero-cta {
    margin-top: 8px;
    gap: 10px;
    width: 100%;
  }

  .hero-register-btn {
    font-size: 1.1rem !important;
    padding: 16px 36px !important;
    width: 100%;
    max-width: 320px;
    border-radius: 14px !important;
  }

  .hero-cta-hint {
    font-size: 0.9rem;
  }
  
  .project-info {
    margin-top: 20px;
    gap: 12px;
  }
  
  .project-badge {
    padding: 5px 10px;
  }
  
  .project-text {
    font-size: 0.8rem;
  }
}
</style>

