<template>
  <v-card class="card login-card" elevation="8">
    <LoginTabs
      :theme-color="themeColor"
      :now-tab="nowTab"
      @update:nowTab="$emit('update:nowTab', $event)"
    />
    
    <LoginFormWindow
      :now-tab="nowTab"
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
      @login-by-username="$emit('login-by-username')"
      @login-by-email="$emit('login-by-email')"
      @register-by-email="$emit('register-by-email')"
      @register-by-invite="$emit('register-by-invite')"
      @step="$emit('step')"
      @step-back="$emit('step-back')"
      @to-url="$emit('to-url', $event)"
      @update:loginByUsernameData="$emit('update:loginByUsernameData', $event)"
      @update:loginByEmailData="$emit('update:loginByEmailData', $event)"
      @update:registerByEmailData="$emit('update:registerByEmailData', $event)"
      @update:registerByInviteData="$emit('update:registerByInviteData', $event)"
      @update:passwdVisible="$emit('update:passwdVisible', $event)"
    />
    
    <LoginBottomBar
      :now-tab="nowTab"
      :login-method="loginMethod"
      :register-method="registerMethod"
      :theme-color="themeColor"
      @shift-login-method="$emit('shift-login-method')"
      @shift-register-method="$emit('shift-register-method')"
      @agree="$emit('agree', $event)"
    />
  </v-card>
</template>

<script setup>
import LoginTabs from './LoginTabs.vue';
import LoginFormWindow from './LoginFormWindow.vue';
import LoginBottomBar from './LoginBottomBar.vue';

defineProps({
  nowTab: {
    type: String,
    required: true,
  },
  loginMethod: {
    type: String,
    required: true,
  },
  registerMethod: {
    type: String,
    required: true,
  },
  registerByEmailStep: {
    type: Number,
    required: true,
  },
  registerByInviteStep: {
    type: Number,
    required: true,
  },
  loginByUsernameData: {
    type: Object,
    required: true,
  },
  loginByEmailData: {
    type: Object,
    required: true,
  },
  registerByEmailData: {
    type: Object,
    required: true,
  },
  registerByInviteData: {
    type: Object,
    required: true,
  },
  passwdVisible: {
    type: Boolean,
    required: true,
  },
  inputType: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  campusList: {
    type: Array,
    required: true,
  },
  collegeList: {
    type: Array,
    required: true,
  },
  loading: {
    type: Object,
    required: true,
  },
});

defineEmits([
  'update:nowTab',
  'login-by-username',
  'login-by-email',
  'register-by-email',
  'register-by-invite',
  'step',
  'step-back',
  'to-url',
  'update:loginByUsernameData',
  'update:loginByEmailData',
  'update:registerByEmailData',
  'update:registerByInviteData',
  'update:passwdVisible',
  'shift-login-method',
  'shift-register-method',
  'agree',
]);
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (min-width: 1000px) {
  .login-card {
    width: 520px;
    max-width: 90vw;
  }
}

@media screen and (max-width: 1000px) {
  .login-card {
    width: 90vw;
    max-width: 420px;
  }
}
</style>

