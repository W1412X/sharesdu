<template>
  <div :class="sectionClass">
    <div class="section-subtitle">加入我们的社区</div>
    <div class="contact-text">
      本站提供 Android、iOS 以及 Harmony 三种移动端 APP（点击右上角APP下载安装）<br/>
      扫描下方二维码或<a href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处</a>，加入官方QQ交流群/关注公众号
    </div>
    <div class="img-container">
      <div class="qr-item">
        <img class="img" src="/qq_img/group_qr.png" />
        <div class="qr-label">QQ交流群</div>
      </div>
      <div class="qr-item">
        <img class="img" src="/wechat/wechat_qr.jpg" />
        <div class="qr-label">微信公众号</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sectionClass: {
    type: String,
    default: 'contact-section',
  },
});
</script>

<style scoped>
.contact-section {
  margin-top: 50px;
  text-align: center;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-text {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.8;
  max-width: 680px;
  margin: 0 auto 30px;
  text-align: center;
}

.contact-text a {
  color: var(--welcome-theme-color, #667eea);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.contact-text a:hover {
  border-bottom-color: var(--welcome-theme-color, #667eea);
  opacity: 0.8;
}

.img-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-top: 30px;
  width: 100%;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.qr-item:hover {
  transform: translateY(-4px);
}

.qr-label {
  margin-top: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: 0.3px;
}

.section-subtitle {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: -0.3px;
}

.img {
  height: 220px;
  width: 220px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15),
              0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.img:hover {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 16px 40px rgba(102, 126, 234, 0.3),
              0 8px 16px rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
}

@media screen and (min-width: 1000px) {
  .contact-section {
    margin-top: 50px;
    padding: 50px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(255, 255, 255, 0.85) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    align-items: center;
  }

  .contact-text {
    font-size: 1rem;
    max-width: 720px;
  }

  .img-container {
    justify-content: center;
    margin-top: 30px;
    width: fit-content;
    height: fit-content;
    gap: 50px;
  }

  .section-subtitle {
    font-size: 1.8rem;
    margin-bottom: 24px;
  }
}

@media screen and (max-width: 1000px) {
  .contact-section {
    margin-top: 35px;
    padding: 0 8px;
    align-items: center;
  }

  .contact-text {
    font-size: 0.9rem;
    line-height: 1.7;
    padding: 0 8px;
    max-width: 100%;
  }

  .img-container {
    margin-top: 24px;
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 28px;
  }

  .img {
    height: 160px;
    width: 160px;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12),
                0 2px 8px rgba(0, 0, 0, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  .qr-label {
    font-size: 0.95rem;
    margin-top: 10px;
  }

  .section-subtitle {
    font-size: 1.35rem;
    margin-bottom: 16px;
  }
}
</style>

