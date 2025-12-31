<template>
  <v-card class="manage-card" elevation="2">
    <v-card-title class="card-header">
      <v-icon icon="mdi-account-lock" :color="themeColor" size="24" class="header-icon"></v-icon>
      <span class="header-title">用户封禁管理</span>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="card-content">
      <div class="form-section">
        <v-text-field
          v-model="localItemId"
          label="用户ID"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          hint="请输入要操作的用户ID"
          persistent-hint
          class="form-field"
          prepend-inner-icon="mdi-identifier"
        ></v-text-field>
        
        <v-text-field
          v-model.number="localBlockDays"
          label="封禁时间（天数）"
          type="number"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          hint="请输入1-90之间的整数"
          persistent-hint
          min="1"
          max="90"
          class="form-field"
          prepend-inner-icon="mdi-clock-outline"
        ></v-text-field>
      </div>
      
      <div class="action-section">
        <v-btn
          variant="elevated"
          @click="handleShowConfirm"
          :color="themeColor"
          size="large"
          prepend-icon="mdi-lock"
          class="action-btn">
          封禁用户
        </v-btn>
        <v-btn
          variant="outlined"
          @click="handleUnblock"
          :color="themeColor"
          size="large"
          prepend-icon="mdi-lock-open-variant"
          class="action-btn">
          解封用户
        </v-btn>
      </div>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-text class="card-content">
      <div class="block-list-section">
        <div class="section-title-wrapper">
          <h3 class="section-title">封禁用户列表</h3>
        </div>
        
        <BlockUserListCard
          :if-show="true"
          :block-user-list="blockUserList">
        </BlockUserListCard>
        
        <div class="action-section">
          <v-btn 
            @click="handleLoadBlockUser" 
            variant="outlined" 
            :color="themeColor"
            :disabled="isLoadingBlockUser || blockUserList.length > 0"
            :loading="isLoadingBlockUser"
            size="large"
            prepend-icon="mdi-refresh"
            class="load-btn">
            加载封禁用户
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import BlockUserListCard from './BlockUserListCard.vue';

const props = defineProps({
  itemId: {
    type: String,
    default: null,
  },
  blockDays: {
    type: Number,
    default: 0,
  },
  blockUserList: {
    type: Array,
    default: () => [],
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'update:itemId',
  'update:blockDays',
  'show-confirm',
  'unblock',
  'load-block-user',
]);

const localItemId = ref(props.itemId || '');
const localBlockDays = ref(props.blockDays || 0);

watch(() => props.itemId, (newVal) => {
  localItemId.value = newVal || '';
});

watch(() => props.blockDays, (newVal) => {
  localBlockDays.value = newVal || 0;
});

watch(localItemId, (newVal) => {
  emit('update:itemId', newVal);
});

watch(localBlockDays, (newVal) => {
  emit('update:blockDays', newVal);
});

const handleShowConfirm = () => {
  emit('show-confirm');
};

const handleUnblock = () => {
  emit('unblock');
};

const isLoadingBlockUser = ref(false);

const handleLoadBlockUser = async () => {
  if (isLoadingBlockUser.value) return;
  isLoadingBlockUser.value = true;
  emit('load-block-user');
  setTimeout(() => {
    isLoadingBlockUser.value = false;
  }, 1000);
};
</script>

<style scoped>
.manage-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background-color: rgba(0, 0, 0, 0.02);
}

.header-icon {
  margin-right: 4px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.card-content {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.action-section {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.action-btn {
  min-width: 140px;
}

.block-list-section {
  margin-top: 0;
}

.section-title-wrapper {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #555;
  margin: 0;
}

.block-list-section .action-section {
  justify-content: center;
  padding-top: 16px;
}

.load-btn {
  min-width: 160px;
}

@media screen and (max-width: 768px) {
  .manage-card {
    max-width: 100%;
  }
  
  .card-header {
    padding: 16px 20px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .card-content {
    padding: 20px 16px;
  }
  
  .action-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn {
    width: 100%;
    min-width: unset;
  }
  
  .load-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>
