<template>
  <div>
    <sensitive-text-field 
      :model-value="loginData.userName"
      @update:model-value="$emit('update:loginData', { ...loginData, userName: $event })"
      :rules="[loginRules.userName]"
      class="input" 
      :density="inputType" 
      variant="solo-filled" 
      label="用户名"
      prepend-inner-icon="mdi-account">
    </sensitive-text-field>
    <sensitive-text-field 
      class="input" 
      :model-value="loginData.passwd"
      @update:model-value="$emit('update:loginData', { ...loginData, passwd: $event })"
      :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="passwdVisible ? 'text' : 'password'" 
      :density="inputType"
      :rules="[loginRules.password]" 
      placeholder="输入密码" 
      prepend-inner-icon="mdi-lock-outline"
      variant="solo-filled" 
      label="输入密码"
      @click:append-inner="$emit('update:passwdVisible', !passwdVisible)">
    </sensitive-text-field>
    <v-btn 
      @click="$emit('login')" 
      class="login-btn" 
      variant="flat"
      :disabled="!(valUserName(loginData.userName) && valPassWord(loginData.passwd))"
      :loading="loading"
      :color="themeColor"
      size="large"
      rounded="lg">
      <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-login</v-icon>
      登录
    </v-btn>
  </div>
</template>

<script setup>
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { rules } from '@/utils/rules';
import { validatePassWord, validateUserName } from '@/utils/rules';

defineProps({
  loginData: {
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
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['login', 'update:loginData', 'update:passwdVisible']);

const loginRules = rules;

const valUserName = (name) => {
  return validateUserName(name);
};

const valPassWord = (passWord) => {
  return validatePassWord(passWord);
};
</script>

<style scoped>
.input {
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 20px;
}

.login-btn {
  width: 70%;
  min-width: 200px;
  margin: 24px auto;
  display: block;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

@media screen and (max-width: 1000px) {
  .input {
    margin-top: 16px;
  }
  
  .login-btn {
    width: 85%;
    margin: 20px auto;
  }
}
</style>

