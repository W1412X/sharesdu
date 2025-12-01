<template>
  <div v-if="show" class="splash-screen">
    <div class="splash-content">
      <!-- 网站图标 -->
      <div class="logo-container">
        <img 
          src="/favicon.ico" 
          alt="ShareSDU Logo" 
          class="logo-icon"
          @error="handleImageError"
        />
      </div>
      
      <!-- ShareSDU 文字 -->
      <div class="app-name">ShareSDU</div>
      
      <!-- 加载视图 -->
      <div class="loading-container">
        <v-progress-circular
          :size="40"
          :width="4"
          :color="themeColor"
          indeterminate
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script>
import { globalProperties } from '@/main';

export default {
  name: 'SplashScreen',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      themeColor: globalProperties.$themeColor,
    };
  },
  methods: {
    handleImageError(event) {
      // 如果 favicon 加载失败，使用默认图标
      event.target.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'logo-icon-fallback';
      fallback.innerHTML = '<i class="mdi mdi-share-variant" style="font-size: 80px; color: ' + this.themeColor + ';"></i>';
      event.target.parentNode.appendChild(fallback);
    },
  },
};
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeOut 0.3s ease-out forwards;
  animation-delay: 0.5s;
}

.splash-screen:not(.fade-out) {
  animation: none;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  animation: scaleIn 0.5s ease-out;
}

.logo-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: pulse 2s ease-in-out infinite;
}

.logo-icon-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 32px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  letter-spacing: 2px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  animation: fadeIn 0.6s ease-out 0.4s both;
}

/* 动画 */
@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

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
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}

/* 移动端适配 */
@media screen and (max-width: 1000px) {
  .logo-container {
    width: 100px;
    height: 100px;
  }

  .app-name {
    font-size: 28px;
  }
}
</style>
