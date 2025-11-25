<template>
  <div>
    <sensitive-text-field 
      :model-value="loginData.email"
      @update:model-value="$emit('update:loginData', { ...loginData, email: $event })"
      class="input"
      :rules="[loginRules.email]" 
      :density="inputType" 
      variant="solo-filled" 
      label="邮箱"
      prepend-inner-icon="mdi-email">
    </sensitive-text-field>
    <v-btn 
      @click="$emit('login')" 
      class="login-btn" 
      variant="flat" 
      :color="themeColor"
      :disabled="!valEmail(loginData.email)"
      size="large"
      rounded="lg">
      <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-email</v-icon>
      登录
    </v-btn>
  </div>
</template>

<script setup>
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { rules } from '@/utils/rules';
import { validateEmail } from '@/utils/rules';

defineProps({
  loginData: {
    type: Object,
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
});

defineEmits(['login', 'update:loginData']);

const loginRules = rules;

const valEmail = (email) => {
  return validateEmail(email);
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

