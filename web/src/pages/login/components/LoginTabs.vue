<template>
  <v-tabs :model-value="nowTab" @update:model-value="$emit('update:nowTab', $event)" :bg-color="themeColor" fixed-tabs class="login-tabs">
    <v-tab 
      value="login" 
      class="custom-tab"
      :class="{ 'tab-active': nowTab === 'login' }">
      <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-login</v-icon>
      <span class="tab-text">登录</span>
    </v-tab>
    <v-tab 
      value="register" 
      class="custom-tab"
      :class="{ 'tab-active': nowTab === 'register' }">
      <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-account-plus</v-icon>
      <span class="tab-text">注册</span>
    </v-tab>
  </v-tabs>
</template>

<script setup>
defineProps({
  themeColor: {
    type: String,
    required: true,
  },
  nowTab: {
    type: String,
    required: true,
  },
});

defineEmits(['update:nowTab']);
</script>

<style scoped>
.login-tabs {
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.custom-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.tab-active {
  font-weight: 600;
}

.tab-icon {
  transition: transform 0.3s ease;
}

.tab-active .tab-icon {
  transform: scale(1.1);
}

.tab-text {
  font-size: 16px;
}
</style>

