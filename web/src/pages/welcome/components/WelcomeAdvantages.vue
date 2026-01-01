<template>
  <div :class="cardClass">
    <div class="section-title-small">平台优势</div>
    <div class="advantage-list">
      <div class="advantage-item">
        <v-icon color="success">mdi-check-circle</v-icon>
        <span><strong>精准实时</strong> - 所有内容均由本校学生创作，确保信息准确及时</span>
      </div>
      <div class="advantage-item">
        <v-icon color="success">mdi-check-circle</v-icon>
        <span><strong>用户纯净</strong> - 校园邮箱认证，用户均来自本校，可筛选非本校人员</span>
      </div>
      <div class="advantage-item">
        <v-icon color="success">mdi-check-circle</v-icon>
        <span><strong>方便快捷</strong> - 强大的搜索功能，快速获取想要的特定信息</span>
      </div>
      <div class="advantage-item">
        <v-icon color="success">mdi-check-circle</v-icon>
        <span><strong>开放灵活</strong> - 支持邮箱换绑，避免毕业因校园邮箱失效导致账户丢失</span>
      </div>
      <div class="advantage-item">
        <v-icon color="success">mdi-check-circle</v-icon>
        <span><strong>无网络限制</strong> - 采用校园邮箱认证，无需校园网即可访问</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cardClass: {
    type: String,
    default: 'advantages-section',
  },
});
</script>

<style scoped>
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

.advantages-section {
  margin: 0;
  padding: 40px 35px;
  background: linear-gradient(135deg, 
    rgba(76, 175, 80, 0.08) 0%, 
    rgba(56, 142, 60, 0.08) 100%);
  border-radius: 24px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.advantages-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #4CAF50 0%, #388e3c 100%);
  border-radius: 2px;
}

.advantages-section-card {
  padding: 40px 35px;
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

.advantages-section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.06);
}

.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.advantage-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 1.05rem;
  color: #2d3748;
  line-height: 1.7;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.advantage-item:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateX(4px);
}

.advantage-item .v-icon {
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3));
}

@media screen and (min-width: 1000px) {
  .advantages-section-card {
    padding: 40px 35px;
  }

  .section-title-small {
    font-size: 1.8rem;
    margin-bottom: 24px;
  }

  .advantage-item {
    font-size: 1.05rem;
    padding: 14px;
  }
}

@media screen and (max-width: 1000px) {
  .advantages-section {
    margin: 35px 0;
    padding: 24px 18px;
    border-radius: 20px;
  }

  .advantage-list {
    gap: 14px;
  }

  .advantage-item {
    font-size: 0.95rem;
    gap: 12px;
    align-items: flex-start;
    padding: 10px;
  }

  .advantage-item .v-icon {
    font-size: 22px !important;
    margin-top: 2px;
  }
}
</style>

