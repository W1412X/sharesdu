<template>
  <v-tabs-window :model-value="nowTab">
    <!-- login by userName -->
    <v-tabs-window-item v-if="loginMethod === 'userName'" title="登录" value="login">
      <LoginFormByUsername
        :login-data="loginByUsernameData"
        :passwd-visible="passwdVisible"
        :input-type="inputType"
        :theme-color="themeColor"
        :loading="loading.login"
        @login="$emit('login-by-username')"
        @update:loginData="$emit('update:loginByUsernameData', $event)"
        @update:passwdVisible="$emit('update:passwdVisible', $event)"
      />
    </v-tabs-window-item>
    
    <!-- login by email -->
    <v-tabs-window-item v-if="loginMethod === 'email'" title="登录" value="login">
      <LoginFormByEmail
        :login-data="loginByEmailData"
        :input-type="inputType"
        :theme-color="themeColor"
        @login="$emit('login-by-email')"
        @update:loginData="$emit('update:loginByEmailData', $event)"
      />
    </v-tabs-window-item>
    
    <!-- register by email STEP 1 -->
    <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 0" title="注册" value="register">
      <RegisterFormByEmail
        :register-data="registerByEmailData"
        :step="0"
        :passwd-visible="passwdVisible"
        :input-type="inputType"
        :theme-color="themeColor"
        :campus-list="campusList"
        :college-list="collegeList"
        @next="$emit('step')"
        @update:registerData="$emit('update:registerByEmailData', $event)"
        @update:passwdVisible="$emit('update:passwdVisible', $event)"
      />
    </v-tabs-window-item>
    
    <!-- register by email STEP 2 -->
    <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 1" title="注册" value="register">
      <RegisterFormByEmail
        :register-data="registerByEmailData"
        :step="1"
        :passwd-visible="passwdVisible"
        :input-type="inputType"
        :theme-color="themeColor"
        :campus-list="campusList"
        :college-list="collegeList"
        @back="$emit('step-back')"
        @register="$emit('register-by-email')"
        @to-url="$emit('to-url', $event)"
        @update:registerData="$emit('update:registerByEmailData', $event)"
        @update:passwdVisible="$emit('update:passwdVisible', $event)"
      />
    </v-tabs-window-item>
    
    <!-- register by invite STEP 1 -->
    <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 0" title="注册" value="register">
      <RegisterFormByInvite
        :register-data="registerByInviteData"
        :step="0"
        :passwd-visible="passwdVisible"
        :input-type="inputType"
        :theme-color="themeColor"
        :campus-list="campusList"
        :college-list="collegeList"
        @next="$emit('step')"
        @update:registerData="$emit('update:registerByInviteData', $event)"
        @update:passwdVisible="$emit('update:passwdVisible', $event)"
      />
    </v-tabs-window-item>
    
    <!-- register by invite STEP 2 -->
    <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 1" title="注册" value="register">
      <RegisterFormByInvite
        :register-data="registerByInviteData"
        :step="1"
        :passwd-visible="passwdVisible"
        :input-type="inputType"
        :theme-color="themeColor"
        :campus-list="campusList"
        :college-list="collegeList"
        @back="$emit('step-back')"
        @register="$emit('register-by-invite')"
        @to-url="$emit('to-url', $event)"
        @update:registerData="$emit('update:registerByInviteData', $event)"
        @update:passwdVisible="$emit('update:passwdVisible', $event)"
      />
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
import LoginFormByUsername from './LoginFormByUsername.vue';
import LoginFormByEmail from './LoginFormByEmail.vue';
import RegisterFormByEmail from './RegisterFormByEmail.vue';
import RegisterFormByInvite from './RegisterFormByInvite.vue';

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
]);
</script>

<style scoped>
.v-tabs-window-item {
  padding: 24px 0;
}
</style>

