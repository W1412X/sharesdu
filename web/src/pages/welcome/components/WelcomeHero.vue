<template>
  <div class="hero-section">
    <div class="title-big-bold intro-text-div hero-title">ShareSDU</div>
    <div class="hero-subtitle">大学交流分享平台</div>
    <div class="title intro-text-div hero-description">
      为大学生活提供一个分享、交流与学习的平台
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
  margin: 0 auto;
  line-height: 1.8;
  position: relative;
  z-index: 1;
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
  }
}
</style>

