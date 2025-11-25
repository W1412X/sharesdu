<template>
    <div class="login-page-container">
        <canvas class="background" id="canvas"></canvas>
        <div class="login-content-wrapper">
      <!-- 邮箱验证对话框 -->
            <v-dialog v-model="ifShowDialog" class="full-screen dialog">
                <div class="dialog-content">
          <email-examine-card
            v-if="ifShowEmailExamineCard"
            @close="setEmailExamineCardState(false)"
            :init-data="examineCardInfo"
            @alert="handleAlert"
            @set_loading="handleSetLoading"
          />
                </div>
            </v-dialog>
      
            <!-- PC端：左右分栏布局 -->
            <div v-if="!ifMobile" class="pc-login-layout">
                <!-- 左侧：功能预览轮播 -->
        <LoginCarousel
          :theme-color="themeColor"
          :carousel-slides="carouselSlides"
        />
        
                <!-- 右侧：登录/注册表单 -->
                <div class="form-section">
          <LoginFormCard
            v-model:nowTab="nowTab"
            :login-method="loginMethod"
            :register-method="registerMethod"
            :register-by-email-step="registerByEmailStep"
            :register-by-invite-step="registerByInviteStep"
            :login-by-username-data="loginByUsernameData"
            :login-by-email-data="loginByEmailData"
            :register-by-email-data="registerByEmailData"
            :register-by-invite-data="registerByInviteData"
            :passwd-visible="passwdVisible"
            :input-type="inputType"
            :theme-color="themeColor"
            :campus-list="campusList"
            :college-list="collegeList"
            :loading="loading"
          @login-by-username="handleLoginByUsername"
          @login-by-email="handleLoginByEmail"
          @register-by-email="handleRegisterByEmail"
          @register-by-invite="handleRegisterByInvite"
          @step="handleStep"
          @step-back="handleStepBack"
          @to-url="handleToUrl"
          @update:loginByUsernameData="loginByUsernameData = $event"
          @update:loginByEmailData="loginByEmailData = $event"
          @update:registerByEmailData="registerByEmailData = $event"
          @update:registerByInviteData="registerByInviteData = $event"
          @update:passwdVisible="passwdVisible = $event"
            @shift-login-method="shiftLoginMethod"
            @shift-register-method="shiftRegisterMethod"
            @agree="handleAgree"
          />
          
                            <v-btn 
            @click="handleToUrl('/#/')"
                        :color="themeColor" 
                        class="return-welcome-btn" 
                        variant="text"
                        rounded="lg">
                        <v-icon size="18" class="mr-1">mdi-home</v-icon>
                        返回首页
                    </v-btn>
                </div>
            </div>
      
            <!-- 移动端：保持原有布局 -->
            <div v-else class="full-center mobile-login-layout">
        <LoginFormCard
          v-model:nowTab="nowTab"
          :login-method="loginMethod"
          :register-method="registerMethod"
          :register-by-email-step="registerByEmailStep"
          :register-by-invite-step="registerByInviteStep"
          :login-by-username-data="loginByUsernameData"
          :login-by-email-data="loginByEmailData"
          :register-by-email-data="registerByEmailData"
          :register-by-invite-data="registerByInviteData"
          :passwd-visible="passwdVisible"
          :input-type="inputType"
          :theme-color="themeColor"
          :campus-list="campusList"
          :college-list="collegeList"
          :loading="loading"
          @login-by-username="handleLoginByUsername"
          @login-by-email="handleLoginByEmail"
          @register-by-email="handleRegisterByEmail"
          @register-by-invite="handleRegisterByInvite"
          @step="handleStep"
          @step-back="handleStepBack"
          @to-url="handleToUrl"
          @update:loginByUsernameData="loginByUsernameData = $event"
          @update:loginByEmailData="loginByEmailData = $event"
          @update:registerByEmailData="registerByEmailData = $event"
          @update:registerByInviteData="registerByInviteData = $event"
          @update:passwdVisible="passwdVisible = $event"
          @shift-login-method="shiftLoginMethod"
          @shift-register-method="shiftRegisterMethod"
          @agree="handleAgree"
        />
        
                            <v-btn 
          @click="handleToUrl('/#/')"
                    :color="themeColor" 
                    class="return-welcome-btn" 
                    variant="text"
                    rounded="lg">
                    <v-icon size="18" class="mr-1">mdi-home</v-icon>
                    返回首页
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import EmailExamineCard from '@/components/user/EmailExamineCard.vue';
import {
  LoginCarousel,
  LoginFormCard,
} from './components';
import {
  useLoginState,
  useLoginData,
  useLoginActions,
  useLoginRestore,
} from './utils';

// 定义组件名称
defineOptions({
    name: 'LoginPage',
});

// Props
const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  passwd: {
    type: String,
    default: '',
  },
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 使用 Composables
const {
            themeColor,
  inputType,
  ifMobile,
            ifShowEmailExamineCard,
            ifShowDialog,
  nowTab,
  loginMethod,
  registerMethod,
  registerByEmailStep,
  registerByInviteStep,
  passwdVisible,
  ifSavePasswd,
            setEmailExamineCardState,
  shiftLoginMethod,
  shiftRegisterMethod,
} = useLoginState();

const {
  loginByUsernameData,
  loginByEmailData,
  registerByEmailData,
  registerByInviteData,
  apiUrl,
            campusList,
            collegeList,
  loading,
            carouselSlides,
} = useLoginData();

// 计算邮箱验证卡片信息
const examineCardInfo = computed(() => {
  if (nowTab.value === 'login') {
                return {
                    type: 'login',
      email: loginByEmailData.value.email,
    };
            } else {
    if (registerMethod.value === 'email') {
                    return {
                        type: 'register',
        email: registerByEmailData.value.email,
        campus: registerByEmailData.value.campus,
        college: registerByEmailData.value.college,
        major: registerByEmailData.value.major,
        userName: registerByEmailData.value.userName,
        passwd: registerByEmailData.value.passwd,
      };
    } else {
                    return {
                        type: 'register',
        email: registerByInviteData.value.email,
        campus: registerByInviteData.value.campus,
        college: registerByInviteData.value.college,
        major: registerByInviteData.value.major,
        userName: registerByInviteData.value.userName,
        passwd: registerByInviteData.value.passwd,
        inviteCode: registerByInviteData.value.inviteCode,
      };
    }
  }
});

// 操作处理
const {
  loginByUsername,
  loginByEmail,
  registerByEmail,
  registerByInvite,
  step,
  stepBack,
  toUrl,
} = useLoginActions(
            loginByUsernameData,
            loginByEmailData,
            registerByEmailData,
            registerByInviteData,
            loginMethod,
            registerMethod,
            registerByEmailStep,
            registerByInviteStep,
  loading,
  apiUrl,
  ifSavePasswd,
  setEmailExamineCardState,
  (msg) => emit('alert', msg)
);

// 状态恢复
const { saveState, restoreState, restoreInitialData } = useLoginRestore();

// 事件处理
const handleLoginByUsername = () => {
  loginByUsername();
};

const handleLoginByEmail = () => {
  loginByEmail();
};

const handleRegisterByEmail = () => {
  registerByEmail();
};

const handleRegisterByInvite = () => {
  registerByInvite();
};

const handleStep = () => {
  step();
};

const handleStepBack = () => {
  stepBack();
};

const handleToUrl = (url) => {
  toUrl(url);
};

const handleAlert = (msg) => {
  emit('alert', msg);
};

const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

const handleAgree = (state) => {
  ifSavePasswd.value = state;
};

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
    saveState({
      loginByUsernameData: loginByUsernameData.value,
      loginByEmailData: loginByEmailData.value,
      registerByEmailData: registerByEmailData.value,
      registerByInviteData: registerByInviteData.value,
      loginMethod: loginMethod.value,
      registerMethod: registerMethod.value,
      registerByEmailStep: registerByEmailStep.value,
      registerByInviteStep: registerByInviteStep.value,
      ifShowEmailExamineCard: ifShowEmailExamineCard.value,
      nowTab: nowTab.value,
    });
  } catch (e) {
    console.error('Failed to save login state:', e);
  }
            next();
});

// 挂载时恢复状态
onMounted(() => {
  // 恢复保存的状态
  const savedState = restoreState();
  if (savedState) {
    loginByUsernameData.value = savedState.loginByUsernameData || loginByUsernameData.value;
    loginByEmailData.value = savedState.loginByEmailData || loginByEmailData.value;
    registerByEmailData.value = savedState.registerByEmailData || registerByEmailData.value;
    registerByInviteData.value = savedState.registerByInviteData || registerByInviteData.value;
    loginMethod.value = savedState.loginMethod || loginMethod.value;
    registerMethod.value = savedState.registerMethod || registerMethod.value;
    registerByEmailStep.value = savedState.registerByEmailStep ?? registerByEmailStep.value;
    registerByInviteStep.value = savedState.registerByInviteStep ?? registerByInviteStep.value;
    nowTab.value = savedState.nowTab || nowTab.value;
    setEmailExamineCardState(savedState.ifShowEmailExamineCard || false);
  }
  
  // 恢复初始化数据
  restoreInitialData(props, loginByUsernameData);
});
</script>

<style scoped>
.login-page-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.login-content-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
}

.dialog-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.return-welcome-btn {
    margin-top: 24px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: none;
    letter-spacing: 0.3px;
}

.return-welcome-btn:hover {
    transform: translateY(-2px);
}

/* ========== PC端左右分栏布局 ========== */
.pc-login-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.form-section {
    flex: 0 0 520px;
    min-width: 520px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
    overflow-y: auto;
    position: relative;
}

.form-section::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
    opacity: 0.3;
}

.form-section .login-card {
    width: 100%;
    max-width: 480px;
    margin-bottom: 24px;
}

@media screen and (min-width: 1000px) {
    .mobile-login-layout {
        display: none;
    }
    
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 40px 20px;
    }
}

@media screen and (max-width: 1000px) {
    .pc-login-layout {
        display: none;
    }
    
    .mobile-login-layout {
        display: flex;
        width: 100vw;
        min-height: 100vh;
    }
    
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px 16px;
    }
}
</style>
