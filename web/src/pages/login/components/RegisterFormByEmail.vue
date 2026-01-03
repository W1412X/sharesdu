<template>
  <div>
    <!-- STEP 1: 基本信息 -->
    <template v-if="step === 0">
      <div class="text-small tip-text-container">
        <span>团体/组织/毕业生请联系管理员获取验证码</span>
      </div>
      <sensitive-text-field 
        :model-value="registerData.userName"
        @update:model-value="$emit('update:registerData', { ...registerData, userName: $event })"
        prepend-inner-icon="mdi-account" 
        class="input" 
        :rules="[loginRules.userName]"
        :density="inputType" 
        variant="solo-filled" 
        label="用户名" 
        :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'">
      </sensitive-text-field>
      <sensitive-text-field 
        class="input" 
        :model-value="registerData.passwd"
        @update:model-value="$emit('update:registerData', { ...registerData, passwd: $event })"
        :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="passwdVisible ? 'text' : 'password'" 
        :density="inputType"
        :rules="[loginRules.password]" 
        placeholder="输入密码" 
        prepend-inner-icon="mdi-lock-outline"
        variant="solo-filled" 
        label="密码"
        @click:append-inner="$emit('update:passwdVisible', !passwdVisible)">
      </sensitive-text-field>
      <sensitive-text-field 
        class="input" 
        :model-value="registerData.passwdConfirm"
        @update:model-value="$emit('update:registerData', { ...registerData, passwdConfirm: $event })"
        :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="passwdVisible ? 'text' : 'password'" 
        :density="inputType"
        :rules="[loginRules.password, loginRules.passwordConfirm]" 
        placeholder="确认密码" 
        prepend-inner-icon="mdi-lock-outline"
        variant="solo-filled" 
        label="确认密码"
        @click:append-inner="$emit('update:passwdVisible', !passwdVisible)">
      </sensitive-text-field>
      <v-btn 
        @click="$emit('next')" 
        class="login-btn" 
        variant="flat" 
        :color="themeColor"
        :disabled="!(valUserName(registerData.userName) && valPassWord(registerData.passwd) && valPassWord(registerData.passwdConfirm) && registerData.passwd === registerData.passwdConfirm)"
        size="large"
        rounded="lg">
        <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-arrow-right</v-icon>
        下一步
      </v-btn>
    </template>
    
    <!-- STEP 2: 详细信息 -->
    <template v-else>
      <div class="text-small-bold tip-text-container">
        <span>注：当前仅对山东大学开放，校区，学院，专业均为选填</span>
      </div>
      <div class="row-center-div">
        <v-select 
          class="select-input" 
          :model-value="registerData.campus"
          @update:model-value="$emit('update:registerData', { ...registerData, campus: $event })"
          variant="solo-filled" 
          density="compact" 
          :items="campusList" 
          label="校区" 
          hide-details="true">
        </v-select>
        <v-autocomplete 
          class="select-input" 
          :model-value="registerData.college"
          @update:model-value="$emit('update:registerData', { ...registerData, college: $event })"
          variant="solo-filled" 
          density="compact" 
          :items="collegeList" 
          label="学院" 
          hide-details="true">
        </v-autocomplete>
        <sensitive-text-field 
          class="select-input" 
          :model-value="registerData.major"
          @update:model-value="$emit('update:registerData', { ...registerData, major: $event })"
          :density="inputType" 
          variant="solo-filled" 
          label="专业" 
          hide-details="true">
        </sensitive-text-field>
      </div>
      <sensitive-text-field 
        :model-value="studentId"
        @update:model-value="handleStudentIdChange"
        class="input"
        :rules="[loginRules.studentId]" 
        :density="inputType" 
        variant="solo-filled"
        prepend-inner-icon="mdi-email" 
        label="学号"
        :hint="emailConfig.studentIdHint"
        placeholder="请输入学号">
        <template v-slot:append-inner>
          <span class="email-suffix">{{ emailConfig.suffix }}</span>
        </template>
      </sensitive-text-field>
      <div class="text-tiny agreement-text-container" style="width: 100%;display: flex;flex-direction: row;">
        <v-spacer></v-spacer>
        <span @click="$emit('to-url', 'https://info.sdu.edu.cn/info/1007/1530.htm')" style="margin-right: 20px;">
          <strong style="color: grey; text-decoration: underline;">什么是校园邮箱？</strong>
        </span>
      </div>
      <div class="text-small agreement-text-container">
        注册即代表您已阅读并同意
        <span @click="$emit('to-url', '/#/document/to_know')">
          <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
        </span>与
        <span @click="$emit('to-url', '/#/document/privacy')">
          <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
        </span>
      </div>
      <div class="row-center-div">
        <v-btn 
          @click="$emit('back')" 
          class="last-step-btn" 
          variant="outlined"
          :color="themeColor"
          rounded="lg">
          <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
          上一步
        </v-btn>
        <v-btn 
          @click="$emit('register')" 
          class="register-btn" 
          variant="flat"
          :color="themeColor" 
          :disabled="!valEmail(registerData.email)"
          rounded="lg">
          <v-icon size="18" class="mr-1">mdi-account-plus</v-icon>
          注册
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { rules } from '@/utils/rules';
import { validateEmail, validatePassWord, validateUserName } from '@/utils/rules';
import { emailConfig } from '@/config';

const props = defineProps({
  registerData: {
    type: Object,
    required: true,
  },
  step: {
    type: Number,
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
});

const emit = defineEmits(['next', 'back', 'register', 'to-url', 'update:registerData', 'update:passwdVisible']);

const loginRules = {
  ...rules,
  studentId: (value) => {
    if (!value) return '请输入学号';
    // 学号支持字母和数字，长度1-30
    const regex = /^[A-Za-z0-9]{1,30}$/;
    if (!regex.test(value)) {
      return '学号格式不正确';
    }
    return true;
  },
  passwordConfirm: (value) => {
    if (!value) return '请确认密码';
    // 如果密码字段为空，先不验证一致性（由密码字段的验证规则处理）
    if (!props.registerData.passwd) {
      return true;
    }
    if (value !== props.registerData.passwd) {
      return '两次输入的密码不一致';
    }
    return true;
  },
};

// 从完整邮箱中提取学号
const studentId = computed({
  get: () => {
    const email = props.registerData.email || '';
    if (!email) return '';
    
    const suffix = emailConfig.suffix;
    // 如果是山大邮箱，提取学号部分
    if (email.endsWith(suffix)) {
      const studentId = email.replace(suffix, '');
      // 确保学号部分不包含@（避免显示异常）
      if (studentId && !studentId.includes('@')) {
        return studentId;
      }
    }
    // 如果email不是以suffix结尾，可能是异常情况，返回空字符串
    return '';
  },
});

// 处理学号输入变化
const handleStudentIdChange = (value) => {
  const suffix = emailConfig.suffix;
  // 移除用户可能输入的后缀
  let cleanValue = value.replace(suffix, '').trim();
  // 自动添加邮箱后缀
  const fullEmail = cleanValue ? `${cleanValue}${suffix}` : '';
  emit('update:registerData', { ...props.registerData, email: fullEmail });
};

const valEmail = (email) => {
  return validateEmail(email);
};

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

.tip-text-container {
  width: 100%;
  margin-top: 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  color: #666;
  padding: 0 5%;
  text-align: center;
  line-height: 1.5;
}

.row-center-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 0 5%;
}

.select-input {
  flex: 1;
  min-width: 0;
}

.agreement-text-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  padding: 0 5%;
  text-align: center;
  line-height: 1.6;
  flex-wrap: wrap;
}

.agreement-text-container span {
  cursor: pointer;
  transition: all 0.2s ease;
}

.agreement-text-container span:hover {
  opacity: 0.8;
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

.register-btn {
  flex: 1;
  min-width: 120px;
  height: 44px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.last-step-btn {
  flex: 1;
  min-width: 120px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.last-step-btn:hover {
  transform: translateY(-2px);
}

.email-suffix {
  color: #666;
  font-size: 14px;
  padding-right: 8px;
  user-select: none;
  pointer-events: none;
}

@media screen and (max-width: 1000px) {
  .input {
    margin-top: 16px;
  }
  
  .login-btn {
    width: 85%;
    margin: 20px auto;
  }
  
  .row-center-div {
    padding: 0 5%;
    gap: 8px;
  }
  
  .register-btn {
    min-width: 100px;
    height: 42px;
    font-size: 14px;
  }
  
  .last-step-btn {
    min-width: 100px;
    height: 42px;
    font-size: 14px;
  }
}
</style>

