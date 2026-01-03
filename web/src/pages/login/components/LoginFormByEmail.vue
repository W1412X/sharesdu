<template>
  <div>
    <sensitive-text-field 
      :model-value="emailInput"
      @update:model-value="handleEmailChange"
      class="input"
      :rules="[loginRules.email]" 
      :density="inputType" 
      variant="solo-filled" 
      label="邮箱"
      :hint="emailHint"
      placeholder="请输入学号或完整邮箱"
      prepend-inner-icon="mdi-email">
      <template v-slot:append-inner v-if="showSuffix">
        <span class="email-suffix">{{ emailConfig.suffix }}</span>
      </template>
    </sensitive-text-field>
    <v-btn 
      @click="$emit('login')" 
      class="login-btn" 
      variant="flat" 
      :color="themeColor"
      :disabled="!valEmailForLogin(loginData.email)"
      size="large"
      rounded="lg">
      <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-email</v-icon>
      登录
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { validateEmailForLogin } from '@/utils/rules';
import { emailConfig } from '@/config';

const props = defineProps({
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

const emit = defineEmits(['login', 'update:loginData']);

// 邮箱验证规则（支持完整邮箱格式）
const loginRules = {
  email: (value) => {
    if (!value) return '请输入邮箱或学号';
    // 如果包含@，验证为完整邮箱格式
    if (value.includes('@')) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
      if (!emailRegex.test(value)) {
        return '请输入正确的邮箱格式';
      }
      return true;
    }
    // 如果不包含@，验证为学号格式
    const studentIdRegex = /^[A-Za-z0-9]{1,30}$/;
    if (!studentIdRegex.test(value)) {
      return '学号格式不正确';
    }
    return true;
  },
};

// 显示在输入框中的值
const emailInput = computed({
  get: () => {
    const email = props.loginData.email || '';
    const suffix = emailConfig.suffix;
    // 如果是山大邮箱，显示学号部分
    if (email.endsWith(suffix)) {
      return email.replace(suffix, '');
    }
    // 否则显示完整邮箱
    return email;
  },
});

// 是否显示后缀（仅当输入的是学号时显示）
const showSuffix = computed(() => {
  const input = emailInput.value || '';
  // 如果输入不包含@，认为是学号，显示后缀
  return input && !input.includes('@');
});

// 提示文本
const emailHint = computed(() => {
  return '请输入学号（自动添加后缀）或完整邮箱地址';
});

// 处理邮箱输入变化
const handleEmailChange = (value) => {
  if (!value) {
    emit('update:loginData', { ...props.loginData, email: '' });
    return;
  }
  
  const suffix = emailConfig.suffix;
  
  // 如果输入包含@，认为是完整邮箱，直接使用
  if (value.includes('@')) {
    emit('update:loginData', { ...props.loginData, email: value.trim() });
    return;
  }
  
  // 如果不包含@，认为是学号，自动添加后缀
  let cleanValue = value.replace(suffix, '').trim();
  const fullEmail = cleanValue ? `${cleanValue}${suffix}` : '';
  emit('update:loginData', { ...props.loginData, email: fullEmail });
};

const valEmailForLogin = (email) => {
  return validateEmailForLogin(email);
};
</script>

<style scoped>
.input {
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 20px;
}

.email-suffix {
  color: #666;
  font-size: 14px;
  padding-right: 8px;
  user-select: none;
  pointer-events: none;
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

