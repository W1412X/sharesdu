<template>
  <v-card class="manage-card" elevation="2">
    <v-card-title class="card-header">
      <v-icon icon="mdi-book-open-variant" :color="themeColor" size="24" class="header-icon"></v-icon>
      <span class="header-title">课程管理</span>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="card-content">
      <div class="form-section">
        <v-text-field
          v-model="localItemId"
          label="课程ID"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          hint="请输入要操作的课程ID"
          persistent-hint
          class="form-field"
          prepend-inner-icon="mdi-identifier"
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
          冻结课程
        </v-btn>
        <v-btn
          variant="outlined"
          @click="handleUnfreeze"
          :color="themeColor"
          size="large"
          prepend-icon="mdi-lock-open-variant"
          class="action-btn">
          解冻课程
        </v-btn>
        <v-btn
          variant="outlined"
          @click="handleRollback"
          :color="themeColor"
          size="large"
          prepend-icon="mdi-undo"
          class="action-btn">
          回滚课程
        </v-btn>
        <v-btn
          variant="outlined"
          @click="handleDelete"
          color="error"
          size="large"
          prepend-icon="mdi-delete"
          class="action-btn">
          删除课程
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  itemId: {
    type: String,
    default: null,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'update:itemId',
  'show-confirm',
  'unfreeze',
  'rollback',
  'delete',
]);

const localItemId = ref(props.itemId || '');

watch(() => props.itemId, (newVal) => {
  localItemId.value = newVal || '';
});

watch(localItemId, (newVal) => {
  emit('update:itemId', newVal);
});

const handleShowConfirm = () => {
  emit('show-confirm');
};

const handleUnfreeze = () => {
  emit('unfreeze');
};

const handleRollback = () => {
  emit('rollback');
};

const handleDelete = () => {
  emit('delete');
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
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.action-btn {
  min-width: 140px;
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
}
</style>
