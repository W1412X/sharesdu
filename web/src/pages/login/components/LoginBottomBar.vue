<template>
  <div class="bottom-bar">
    <v-btn 
      v-if="nowTab === 'login'"
      @click="$emit('shift-login-method')" 
      class="switch-method-btn" 
      density="compact" 
      variant="text"
      :color="themeColor">
      <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">
        {{ loginMethod === 'userName' ? 'mdi-email' : 'mdi-account' }}
      </v-icon>
      {{ loginMethod === 'userName' ? '使用邮箱登录' : '使用用户名登录' }}
    </v-btn>
    <v-btn 
      v-if="nowTab === 'register'"
      @click="$emit('shift-register-method')" 
      class="switch-method-btn" 
      density="compact" 
      variant="text"
      :color="themeColor">
      <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">
        {{ registerMethod === 'email' ? 'mdi-key' : 'mdi-email' }}
      </v-icon>
      {{ registerMethod === 'email' ? '使用邀请码注册' : '使用邮箱注册' }}
    </v-btn>
    <v-spacer></v-spacer>
    <agree-button 
      v-if="nowTab === 'login' && loginMethod === 'userName'" 
      @agree="$emit('agree', $event)">
    </agree-button>
  </div>
</template>

<script setup>
import AgreeButton from '@/components/common/AgreeButton.vue';

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
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['shift-login-method', 'shift-register-method', 'agree']);
</script>

<style scoped>
.bottom-bar {
  padding: 16px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.switch-method-btn {
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
  letter-spacing: 0.3px;
}

.switch-method-btn:hover {
  transform: translateX(2px);
}
</style>

