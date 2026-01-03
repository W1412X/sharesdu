<template>
  <div class="footer-section">
    <div class="footer-content">
      <div class="footer-main">
        <!-- 主要内容：左侧品牌 + 右侧三列信息 -->
        <div class="footer-content-main">
          <!-- 左侧：品牌标识和标语 -->
          <div class="footer-brand">
            <span class="brand-name">ShareSDU</span>
            <span class="brand-desc">为大学生活提供分享、交流与学习的平台</span>
          </div>

          <!-- 右侧：三个主要部分 -->
          <div class="footer-sections">
            <!-- 联系我们 -->
            <div class="footer-section-item">
              <div class="footer-link-title">联系我们</div>
              <div class="footer-contact-item">
                <v-icon size="18" color="primary">mdi-email</v-icon>
                <a href="mailto:admin@sharesdu.com" class="footer-link">admin@sharesdu.com</a>
              </div>
              <div class="footer-contact-item">
                <v-icon size="18" color="primary">mdi-qqchat</v-icon>
                <a href="https://qm.qq.com/q/Uh7X13Hp8Q" target="_blank" class="footer-link">QQ群：246680702</a>
              </div>
            </div>

            <!-- 政策信息 -->
            <div class="footer-section-item">
              <div class="footer-link-title">政策信息</div>
              <a href="/#/document/to_know" class="footer-link">入站须知</a>
              <a href="/#/document/privacy" class="footer-link">隐私政策</a>
            </div>
            <!-- 项目开发 -->
            <div class="footer-section-item">
              <div class="footer-link-title">项目开发</div>
              <a href="/#/document/intro" class="footer-link">项目介绍</a>
              <a href="/#/developer" class="footer-link">开发者文档</a>
            </div>
          </div>
        </div>

        <!-- 版权和备案信息 -->
        <div class="footer-copyright">
          <div class="copyright-text">
            <span>© 2024-{{ currentYear }} ShareSDU. All rights reserved.</span>
            <span class="copyright-desc">项目开发始于 2024 年</span>
          </div>
          <div class="footer-icp">
            <a href="https://beian.miit.gov.cn/" target="_blank" class="icp-link">鲁ICP备2024118409号-1</a>
            <div v-if="deviceType == 'desktop'" class="footer-police">
              <img src="/police.png" alt="公安">
              <a href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173" target="_blank" class="icp-link">
                鲁公网安备37028202001173号
              </a>
            </div>
          </div>
          <div class="footer-icp">
            <div v-if="deviceType == 'mobile'" class="footer-police">
              <img src="/police.png" alt="公安">
              <a href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173" target="_blank" class="icp-link">
                鲁公网安备37028202001173号
              </a>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { globalProperties } from '@/main';
const deviceType=globalProperties.$deviceType;
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer-section {
  width: 100%;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.02) 0%, 
    rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 40px 24px;
}

.footer-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-content-main {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: 60px;
  align-items: start;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-gradient-end, #764ba2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.brand-desc {
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.6;
}

.footer-sections {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-section-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-link-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.footer-link {
  font-size: 0.9rem;
  color: #718096;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 0;
  width: fit-content;
}

.footer-link:hover {
  color: var(--welcome-theme-color, #667eea);
  transform: translateX(4px);
}

.footer-copyright {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  margin-bottom: 40px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.copyright-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #718096;
}

.copyright-desc {
  font-size: 0.85rem;
  color: #a0aec0;
}

.footer-icp {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.icp-link {
  font-size: 0.85rem;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s ease;
}

.icp-link:hover {
  color: var(--welcome-theme-color, #667eea);
}

.footer-police {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-police img {
  width: 18px;
  height: 18px;
  filter: grayscale(0.3);
  transition: filter 0.3s ease;
}

.footer-police:hover img {
  filter: grayscale(0);
}

@media screen and (min-width: 1000px) {
  .footer-content {
    padding: 50px 60px 30px;
  }
}

@media screen and (max-width: 1000px) {
  .footer-content {
    padding: 30px 20px 20px;
  }

  .footer-content-main {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-sections {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-section-item {
    gap: 14px;
  }

  .brand-name {
    font-size: 1.5rem;
  }

  .brand-desc {
    font-size: 0.9rem;
  }

  .footer-icp {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .copyright-text {
    font-size: 0.85rem;
  }

  .icp-link {
    font-size: 0.8rem;
  }
}
</style>

