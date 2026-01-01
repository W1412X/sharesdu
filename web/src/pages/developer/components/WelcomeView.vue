<template>
  <div class="welcome-view">
    <div class="welcome-content">
      <!-- 网站图标 -->
      <div class="logo-section">
        <img 
          src="/resource/logo_trans.png" 
          alt="ShareSDU Logo" 
          class="logo-image"
        />
      </div>
      
      <!-- 标题 -->
      <h1 class="welcome-title">ShareSDU 开发文档</h1>
      
      <!-- 说明信息 -->
      <div class="info-section">
        <p class="info-text">
          欢迎来到 ShareSDU 开发者文档中心。这里提供了完整的开发指南、API 参考和开发规范。
        </p>
        <p class="info-text">
          我们支持学生开发者通过 Web 开发创建便于学生生活的微服务，如二手市场、天气服务、搭子寻找等基于学校学习、生活等的方便服务。
        </p>
        <p class="info-text">
          如果您需要身份认证，我们会提供身份认证接口并返回用户的唯一标识，方便您进行用户管理。
        </p>
        <p class="info-text">
          对于微服务平台的内容，您可以选择在本站新建板块或在已有板块下发布帖子来和平台共享数据。
        </p>
        <p class="info-text">
          我们也欢迎同学们参与到前端开发、后端开发以及对平台进行原生移动端应用开发的工作中。
        </p>
      </div>
      
      <!-- 联系信息 -->
      <div class="contact-section">
        <h2 class="contact-title">联系我们</h2>
        <div class="contact-items">
          <div class="contact-item">
            <v-icon :color="themeColor" size="24">mdi-email</v-icon>
            <span class="contact-label">管理员邮箱：</span>
            <a href="mailto:admin@sharesdu.com" class="contact-link">admin@sharesdu.com</a>
          </div>
          <div class="contact-item">
            <v-icon :color="themeColor" size="24">mdi-qqchat</v-icon>
            <span class="contact-label">QQ交流群：</span>
            <span class="contact-value">246680702</span>
          </div>
        </div>
        
        <!-- QQ群二维码 -->
        <div class="qr-section">
          <div class="qr-item">
            <p class="qr-label">QQ交流群</p>
            <img 
              src="/qq_img/group_qr.png" 
              alt="QQ群二维码" 
              class="qr-image"
            />
          </div>
          <div class="qr-item">
            <p class="qr-label">微信公众号</p>
            <img 
              src="/wechat/wechat_qr.jpg" 
              alt="微信公众号二维码" 
              class="qr-image"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  themeColor: {
    type: String,
    default: '#667eea',
  },
});
</script>

<style scoped>
.welcome-view {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: transparent;
}

.welcome-content {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-section {
  margin-bottom: 32px;
}

.logo-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 40px;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.info-section {
  width: 100%;
  text-align: left;
  margin-bottom: 40px;
}

.info-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #4a5568;
  margin: 0 0 16px;
}

.contact-section {
  width: 100%;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.contact-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 24px;
  text-align: center;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1rem;
}

.contact-label {
  color: #718096;
  font-weight: 500;
}

.contact-link {
  color: var(--theme-color, #667eea);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.contact-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.contact-value {
  color: #1a202c;
  font-weight: 500;
}

.qr-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-label {
  font-size: 0.95rem;
  color: #4a5568;
  font-weight: 500;
  margin: 0;
}

.qr-image {
  width: 150px;
  height: 150px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  object-fit: contain;
  background: white;
}

/* 移动端适配 */
@media screen and (max-width: 1000px) {
  .welcome-view {
    padding: 20px 16px;
  }
  
  .welcome-content {
    padding: 40px 24px;
    border-radius: 12px;
  }
  
  .logo-image {
    width: 100px;
    height: 100px;
  }
  
  .welcome-title {
    font-size: 2rem;
    margin-bottom: 32px;
  }
  
  .info-text {
    font-size: 0.95rem;
    margin-bottom: 14px;
  }
  
  .contact-items {
    gap: 12px;
  }
  
  .contact-item {
    font-size: 0.9rem;
    flex-wrap: wrap;
  }
  
  .qr-section {
    gap: 24px;
  }
  
  .qr-image {
    width: 120px;
    height: 120px;
  }
}
</style>

