<template>
  <div class="footer-section">
    <div class="footer-links">
      <a href="https://beian.miit.gov.cn/" target="_blank">鲁ICP备2024118409号-1</a>
    </div>
    <div class="footer-police">
      <img src="/police.png" alt="公安">
      <a href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173">
        鲁公网安备37028202001173号
      </a>
    </div>
  </div>
</template>

<script setup>
// Footer 组件不需要 props
</script>

<style scoped>
.footer-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 24px 20px;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.02) 0%, 
    rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.footer-links a,
.footer-police a {
  font-size: 13px;
  font-weight: 500;
  color: #718096;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.footer-links a:hover,
.footer-police a:hover {
  color: var(--welcome-theme-color, #667eea);
  background: var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1));
}

.footer-police {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-police img {
  width: 20px;
  height: 20px;
  filter: grayscale(0.3);
  transition: filter 0.3s ease;
}

.footer-police:hover img {
  filter: grayscale(0);
}

@media screen and (min-width: 1000px) {
  .footer-section {
    padding: 30px 40px;
  }
}

@media screen and (max-width: 1000px) {
  .footer-section {
    flex-direction: column;
    gap: 12px;
    padding: 20px 16px;
    text-align: center;
  }

  .footer-links a,
  .footer-police a {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>

