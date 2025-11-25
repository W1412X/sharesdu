<template>
  <div class="notices-grid">
    <div class="test-notice">
      <v-icon color="warning" size="20">mdi-alert-circle</v-icon>
      <span>当前正在测试阶段，用户信息不会保留</span>
    </div>
    <div class="legal-notice">
      <v-icon color="error" size="18">mdi-shield-alert</v-icon>
      <span>本站已进行公安备案，发表违法信息后果自负</span>
    </div>
  </div>
</template>

<script setup>
// Notices 组件不需要 props
</script>

<style scoped>
.notices-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 30px 0;
}

.test-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 24px;
  background: linear-gradient(135deg, 
    rgba(255, 152, 0, 0.12) 0%, 
    rgba(255, 193, 7, 0.12) 100%);
  border-radius: 16px;
  margin: 0;
  font-size: 1rem;
  color: #E65100;
  line-height: 1.6;
  border: 1px solid rgba(255, 152, 0, 0.2);
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.1);
  backdrop-filter: blur(10px);
}

.legal-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, 
    rgba(244, 67, 54, 0.12) 0%, 
    rgba(229, 57, 53, 0.12) 100%);
  border-radius: 16px;
  margin: 0;
  font-size: 0.95rem;
  color: #C62828;
  font-weight: 600;
  line-height: 1.6;
  text-align: center;
  border: 1px solid rgba(244, 67, 54, 0.2);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.1);
  backdrop-filter: blur(10px);
}

@media screen and (min-width: 1000px) {
  .notices-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 40px 0;
  }

  .test-notice,
  .legal-notice {
    margin: 0;
  }

  .test-notice {
    padding: 20px 32px;
    margin: 28px 0;
    font-size: 1.05rem;
  }

  .legal-notice {
    padding: 18px 32px;
    margin: 24px 0;
    font-size: 1rem;
  }
}

@media screen and (max-width: 1000px) {
  .test-notice {
    padding: 16px 20px;
    margin: 20px 0;
    font-size: 0.9rem;
    flex-wrap: wrap;
    text-align: center;
    border-radius: 14px;
  }

  .test-notice .v-icon {
    font-size: 20px !important;
  }

  .legal-notice {
    padding: 14px 20px;
    margin: 16px 0;
    font-size: 0.85rem;
    flex-wrap: wrap;
    border-radius: 14px;
  }

  .legal-notice .v-icon {
    font-size: 18px !important;
  }
}
</style>

