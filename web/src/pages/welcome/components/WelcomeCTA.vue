<template>
  <div :class="cardClass">
    <div class="cta-primary">
      <v-btn
        to="/login"
        size="x-large"
        prepend-icon="mdi-account-plus"
        color="primary"
        class="cta-btn"
        elevation="4">
        立即注册账号
      </v-btn>
      <div class="cta-hint">开启你的 ShareSDU 之旅</div>
    </div>
    <div class="cta-secondary">
      <v-btn
        to="/document/intro"
        prepend-icon="mdi-file-document"
        variant="outlined"
        color="primary"
        class="secondary-btn">
        查看详细介绍
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cardClass: {
    type: String,
    default: 'cta-section',
  },
});
</script>

<style scoped>
.cta-section {
  margin: 50px 0;
  text-align: center;
}

.cta-section-card {
  padding: 45px 40px;
  text-align: center;
  border-radius: 24px;
  background: linear-gradient(135deg, 
    var(--welcome-theme-rgba-08, rgba(102, 126, 234, 0.08)) 0%, 
    rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.cta-section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.06);
}

.cta-primary {
  margin-bottom: 24px;
}

.cta-btn {
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

.cta-btn :deep(.v-btn__content) {
  position: relative;
  z-index: 2;
  white-space: nowrap;
  overflow: visible;
}

.cta-btn::before {
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

.cta-btn:hover::before {
  width: 300px;
  height: 300px;
}

.cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px var(--welcome-theme-rgba-50, rgba(102, 126, 234, 0.5)),
              0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.cta-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.cta-hint {
  margin-top: 12px;
  font-size: 1rem;
  color: #718096;
  font-style: italic;
  opacity: 0.8;
}

.cta-secondary {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.secondary-btn {
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

@media screen and (min-width: 1000px) {
  .cta-section {
    margin: 40px 0;
  }

  .cta-btn {
    font-size: 1.4rem !important;
    padding: 22px 64px !important;
    line-height: 1.5 !important;
  }

  .cta-hint {
    font-size: 1.05rem;
    margin-top: 16px;
  }
}

@media screen and (max-width: 1000px) {
  .cta-section {
    margin: 35px 0;
  }

  .cta-primary {
    margin-bottom: 18px;
  }

  .cta-btn {
    font-size: 1.1rem !important;
    padding: 16px 36px !important;
    width: 100%;
    max-width: 320px;
    border-radius: 14px !important;
    line-height: 1.5 !important;
  }

  .cta-hint {
    font-size: 0.9rem;
    margin-top: 10px;
  }

  .cta-secondary {
    gap: 12px;
  }

  .secondary-btn {
    width: 100%;
    max-width: 280px;
    border-radius: 12px !important;
  }
}
</style>

