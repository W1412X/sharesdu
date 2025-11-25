<template>
  <div style="position: fixed;">
    <canvas class="background" id="canvas"></canvas>
    <div style="max-height: 100vh; overflow-y: auto;">
      <!-- 顶部导航栏 -->
      <WelcomeTopBar
        @show-contact="handleShowContact"
        @download-app="handleDownloadApp">
      </WelcomeTopBar>
      
      <div class="logo-line"></div>
      
      <div class="full-center">
        <!-- 对话框 -->
        <WelcomeDialog
          :if-show-dialog="ifShowDialog"
          :if-show-login="ifShowLogin"
          :if-show-contact="ifShowContact"
          :if-show-download="ifShowDownload"
          @update:ifShowDialog="() => {}"
          @close-login="handleCloseLogin"
          @close-contact="handleCloseContact"
          @close-download="handleCloseDownload"
          @download-android="handleDownloadAndroid"
          @download-ios="handleDownloadIOS"
          @download-harmony="handleDownloadHarmony">
        </WelcomeDialog>
        
        <!-- PC端：新布局结构 -->
        <div class="main-content">
          <!-- Hero 区域 -->
          <WelcomeHero></WelcomeHero>
          
          <!-- 主要内容区域：左右分栏布局 -->
          <div class="main-grid">
            <!-- 左侧：功能展示 -->
            <WelcomeFeatures card-class="features-section-card"></WelcomeFeatures>
            
            <!-- 右侧：优势 + CTA -->
            <div class="right-column">
              <!-- 平台优势 -->
              <WelcomeAdvantages card-class="advantages-section-card"></WelcomeAdvantages>
              
              <!-- CTA 按钮区域 -->
              <WelcomeCTA card-class="cta-section-card"></WelcomeCTA>
            </div>
          </div>
          
          <!-- 提示信息区域 -->
          <WelcomeNotices></WelcomeNotices>
          
          <!-- 联系方式 -->
          <WelcomeContact></WelcomeContact>
        </div>
        
        <!-- 移动端：保持原有结构 -->
        <div class="mobile-content">
          <v-card class="intro-card" elevation="12">
            <WelcomeHero></WelcomeHero>
            
            <div class="content-grid">
              <WelcomeFeatures></WelcomeFeatures>
              <WelcomeAdvantages></WelcomeAdvantages>
            </div>
            
            <WelcomeCTA></WelcomeCTA>
            <WelcomeNotices></WelcomeNotices>
            <WelcomeContact></WelcomeContact>
          </v-card>
        </div>
      </div>
      
      <!-- 页脚 -->
      <WelcomeFooter></WelcomeFooter>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import {
  WelcomeTopBar,
  WelcomeDialog,
  WelcomeHero,
  WelcomeFeatures,
  WelcomeAdvantages,
  WelcomeCTA,
  WelcomeNotices,
  WelcomeContact,
  WelcomeFooter,
} from './components';
import {
  useWelcomeState,
  useWelcomeActions,
  useWelcomeTheme,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'WelcomePage',
});

// 使用 Composables
const {
  themeColor,
  ifShowLogin,
  ifShowContact,
  ifShowDownload,
  ifShowDialog,
  setLoginState,
  setContactState,
  setDownloadState,
} = useWelcomeState();

// 操作处理
const {
  downloadApp,
  openUrl,
  downloadIOS,
} = useWelcomeActions(setDownloadState);

// 主题颜色设置
useWelcomeTheme(themeColor);

// 事件处理
const handleShowContact = () => {
  setContactState(true);
};

const handleDownloadApp = () => {
  downloadApp();
};

const handleCloseLogin = () => {
  setLoginState(false);
};

const handleCloseContact = () => {
  setContactState(false);
};

const handleCloseDownload = () => {
  setDownloadState(false);
};

const handleDownloadAndroid = () => {
  openUrl('/app/sharesdu-android.apk');
};

const handleDownloadIOS = () => {
  downloadIOS();
};

const handleDownloadHarmony = () => {
  openUrl('/app/sharesdu-harmony.hap');
};

// 挂载时初始化 canvas 背景（如果需要）
onMounted(() => {
  // canvas 背景初始化逻辑可以在这里添加
});
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.logo-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.08) 50%, 
    transparent 100%);
}

.full-center {
  width: 100%;
  padding: 30px 40px;
}

/* ========== PC端新布局 ========== */
.main-content {
  display: none;
}

.mobile-content {
  display: block;
}

/* ========== 内容网格布局（移动端） ========== */
.content-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.intro-card {
  margin-top: 50px;
  margin-bottom: 30px;
  max-width: 96vw;
  padding: 24px 18px;
  height: fit-content;
  display: grid;
  justify-content: center;
  flex-direction: column;
  border-radius: 24px !important;
}

/* ========== PC 端样式 (min-width: 1000px) ========== */
@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    padding: 30px 40px;
  }

  /* PC端：显示新布局，隐藏移动端布局 */
  .main-content {
    display: block;
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 40px;
  }

  .mobile-content {
    display: none;
  }

  /* PC端：主网格布局 */
  .main-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 40px;
    margin: 50px 0;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
}

/* ========== 移动端样式 (max-width: 1000px) ========== */
@media screen and (max-width: 1000px) {
  /* 移动端：显示移动端布局，隐藏PC端布局 */
  .main-content {
    display: none;
  }

  .mobile-content {
    display: block;
  }

  .full-center {
    width: 100vw;
    display: grid;
    justify-content: center;
    padding: 12px;
  }
}
</style>

