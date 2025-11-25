<template>
  <div class="carousel-section">
    <v-carousel
      v-model="carouselModel"
      :continuous="true"
      :show-arrows="true"
      :hide-delimiters="false"
      :cycle="true"
      :interval="4000"
      height="100%"
      class="feature-carousel"
      :color="themeColor">
      <v-carousel-item v-for="(slide, index) in carouselSlides" :key="index">
        <div class="carousel-slide" :style="{ background: slide.background }">
          <div class="slide-content">
            <div class="slide-icon-wrapper">
              <div class="icon-circle" :style="{ 
                'border-color': `${slide.accentColor || themeColor}40`,
                'box-shadow': `0 8px 24px ${slide.accentColor || themeColor}33, inset 0 2px 8px rgba(255, 255, 255, 0.3)`,
                'background': `linear-gradient(135deg, ${slide.accentColor || themeColor}20 0%, ${slide.accentColor || themeColor}15 100%)`
              }">
                <v-icon :color="slide.accentColor || themeColor" :size="64" class="slide-icon">{{ slide.icon }}</v-icon>
              </div>
            </div>
            <h2 class="slide-title">{{ slide.title }}</h2>
            <p class="slide-subtitle">{{ slide.subtitle }}</p>
            <p class="slide-description">{{ slide.description }}</p>
            
            <!-- 功能特性列表 -->
            <div v-if="slide.features" class="slide-features">
              <div v-for="(feature, idx) in slide.features" :key="idx" class="feature-item">
                <v-icon :color="slide.accentColor || themeColor" size="24" class="feature-icon">{{ feature.icon }}</v-icon>
                <span class="feature-text">{{ feature.text }}</span>
              </div>
            </div>
            
            <!-- 优势列表 -->
            <div v-if="slide.advantages" class="slide-advantages">
              <div v-for="(advantage, idx) in slide.advantages" :key="idx" class="advantage-item">
                <div class="advantage-header">
                  <v-icon :color="slide.accentColor || themeColor" size="22" class="advantage-icon">{{ advantage.icon }}</v-icon>
                  <span class="advantage-title">{{ advantage.text }}</span>
                </div>
                <p class="advantage-desc">{{ advantage.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  themeColor: {
    type: String,
    required: true,
  },
  carouselSlides: {
    type: Array,
    required: true,
  },
});

const carouselModel = ref(0);
</script>

<style scoped>
.carousel-section {
  flex: 1;
  height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  position: relative;
  overflow: hidden;
}

.feature-carousel {
  height: 100%;
  border-radius: 0;
}

.feature-carousel :deep(.v-carousel__controls) {
  background: transparent;
  padding: 20px;
}

.feature-carousel :deep(.v-carousel__prev),
.feature-carousel :deep(.v-carousel__next) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.feature-carousel :deep(.v-carousel__prev:hover),
.feature-carousel :deep(.v-carousel__next:hover) {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.feature-carousel :deep(.v-carousel__prev .v-icon),
.feature-carousel :deep(.v-carousel__next .v-icon) {
  color: var(--theme-color, #667eea);
  font-size: 24px;
}

.feature-carousel :deep(.v-carousel__indicators) {
  background: transparent;
  padding: 20px;
}

.feature-carousel :deep(.v-carousel__indicator) {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
  width: 12px;
  height: 12px;
  margin: 0 6px;
  transition: all 0.3s ease;
}

.feature-carousel :deep(.v-carousel__indicator--active) {
  background: var(--theme-color, #667eea);
  border-color: var(--theme-color, #667eea);
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.carousel-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 60px 80px;
  transition: all 0.5s ease;
  overflow: hidden;
}

.carousel-slide::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

.slide-content {
  text-align: center;
  max-width: 680px;
  animation: slideInUp 0.6s ease-out;
  position: relative;
  z-index: 1;
  padding: 50px 60px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12),
              0 4px 16px rgba(0, 0, 0, 0.08);
}

.slide-icon-wrapper {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
  animation: iconFloat 3s ease-in-out infinite;
}

.icon-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.12) 0%, 
    rgba(118, 75, 162, 0.12) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(102, 126, 234, 0.25);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2),
              inset 0 2px 8px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.icon-circle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: rotate 8s linear infinite;
}

.slide-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.slide-title {
  font-size: 3.8rem;
  font-weight: 900;
  color: #1a202c;
  margin-bottom: 12px;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.slide-subtitle {
  font-size: 1.4rem;
  color: #718096;
  margin-bottom: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.slide-description {
  font-size: 1.15rem;
  color: #4a5568;
  margin-bottom: 32px;
  line-height: 1.8;
  font-weight: 400;
  text-align: center;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.slide-features {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-width: 140px;
  flex: 1;
  max-width: 180px;
}

.feature-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  margin-bottom: 4px;
}

.feature-text {
  font-size: 0.95rem;
  color: #2d3748;
  font-weight: 600;
  text-align: center;
}

.slide-advantages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 32px;
  text-align: left;
}

.advantage-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.advantage-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-color, var(--theme-color, #667eea));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.advantage-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.advantage-item:hover::before {
  opacity: 1;
}

.advantage-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.advantage-icon {
  flex-shrink: 0;
}

.advantage-title {
  font-size: 1.1rem;
  color: #1a202c;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.advantage-desc {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  padding-left: 36px;
  margin-top: 4px;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
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

/* PC端轮播图优化 */
@media screen and (min-width: 1000px) {
  .carousel-slide {
    background-size: cover;
    background-position: center;
    padding: 80px 100px;
  }
  
  .slide-content {
    max-width: 720px;
    padding: 60px 70px;
  }
  
  .icon-circle {
    width: 140px;
    height: 140px;
  }
  
  .slide-icon {
    font-size: 72px !important;
  }
  
  .slide-title {
    font-size: 4.5rem;
    margin-bottom: 16px;
  }
  
  .slide-subtitle {
    font-size: 1.6rem;
    margin-bottom: 28px;
  }
  
  .slide-description {
    font-size: 1.25rem;
    margin-bottom: 40px;
  }
  
  .slide-features {
    gap: 24px;
    margin-top: 40px;
  }
  
  .feature-item {
    padding: 24px 28px;
    min-width: 160px;
    max-width: 200px;
  }
  
  .feature-text {
    font-size: 1.05rem;
  }
  
  .slide-advantages {
    gap: 20px;
    margin-top: 40px;
  }
  
  .advantage-item {
    padding: 24px;
  }
  
  .advantage-title {
    font-size: 1.2rem;
  }
  
  .advantage-desc {
    font-size: 1.05rem;
    padding-left: 40px;
  }
}
</style>

