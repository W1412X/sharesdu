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
        
        <!-- PC端和移动端组件 -->
        <WelcomePagePc v-if="deviceType === 'desktop'" />
        <WelcomePageMobile v-else />
      </div>
      
      <!-- 页脚 -->
      <WelcomeFooter></WelcomeFooter>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { globalProperties } from '@/main';
import {
  WelcomeTopBar,
  WelcomeDialog,
  WelcomeFooter,
} from './components';
import WelcomePagePc from './pc/index.vue';
import WelcomePageMobile from './mobile/index.vue';
import {
  useWelcomeState,
  useWelcomeActions,
  useWelcomeTheme,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'WelcomePage',
});

const deviceType = globalProperties.$deviceType;

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

/* ========== PC 端样式 (min-width: 1000px) ========== */
@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
    padding: 30px 40px;
  }
}

/* ========== 移动端样式 (max-width: 1000px) ========== */
@media screen and (max-width: 1000px) {
  .full-center {
    width: 100vw;
    display: grid;
    justify-content: center;
    padding: 12px;
  }
}
</style>

