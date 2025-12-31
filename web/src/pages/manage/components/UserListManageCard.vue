<template>
  <div class="user-list-manage-container">
    <!-- 用户列表卡片 -->
    <v-card class="manage-card" elevation="2">
      <v-card-title class="card-header">
        <v-icon icon="mdi-account-multiple" :color="themeColor" size="24" class="header-icon"></v-icon>
        <span class="header-title">用户列表</span>
        <v-spacer></v-spacer>
        <div class="header-actions">
          <v-select
            v-model.number="localPageSize"
            :items="pageSizeOptions"
            density="compact"
            variant="outlined"
            label="每页数量"
            style="min-width: 120px; margin-right: 16px;"
            hide-details
            @update:model-value="handlePageSizeChange"
          ></v-select>
          <span class="user-count">
            共<span class="count-number" :style="{ color: themeColor }">{{ totalUserNum || 0 }}</span>个用户
          </span>
        </div>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="card-content">
        <div class="table-container">
          <v-data-table 
            :items="userList" 
            :headers="tableHeaders"
            fixed-header 
            hover
            class="data-table"
            :items-per-page="10"
          >
            <template v-slot:[`item.用户`]="{ item }">
              <avatar-name :init-data="{ id: item.ID, name: item.用户 }"></avatar-name>
            </template>
            <template v-slot:[`item.是否为管理员`]="{ item }">
              <v-icon
                :icon="item.是否为管理员 ? 'mdi-check-circle' : 'mdi-close-circle'"
                :color="item.是否为管理员 ? 'success' : 'grey'"
                size="20">
              </v-icon>
            </template>
            <template v-slot:[`item.是否为超级管理员`]="{ item }">
              <v-icon
                :icon="item.是否为超级管理员 ? 'mdi-check-circle' : 'mdi-close-circle'"
                :color="item.是否为超级管理员 ? 'success' : 'grey'"
                size="20">
              </v-icon>
            </template>
          </v-data-table>
        </div>
        
        <div class="action-section">
          <v-btn 
            @click="handleLoadMore" 
            variant="outlined" 
            :color="themeColor"
            :disabled="isLoadingMore"
            :loading="isLoadingMore"
            size="large"
            prepend-icon="mdi-refresh"
            class="load-btn">
            加载更多
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AvatarName from '@/components/common/AvatarName';

const props = defineProps({
  userList: {
    type: Array,
    default: () => [],
  },
  totalUserNum: {
    type: Number,
    default: null,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'load-user',
  'update:page-size',
]);

const isLoadingMore = ref(false);
const localPageSize = ref(props.pageSize);

const pageSizeOptions = [10, 20, 50, 100];

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal;
});

const handlePageSizeChange = (newSize) => {
  emit('update:page-size', newSize);
};

const tableHeaders = computed(() => [
  { title: '用户', key: '用户', sortable: false },
  { title: '荣誉水平', key: '荣誉水平', sortable: true },
  { title: '点赞数', key: '点赞数', sortable: true },
  { title: '文章数', key: '文章数', sortable: true },
  { title: '管理员', key: '是否为管理员', sortable: false, align: 'center' },
  { title: '超级管理员', key: '是否为超级管理员', sortable: false, align: 'center' },
]);

const handleLoadMore = async () => {
  if (isLoadingMore.value) return;
  isLoadingMore.value = true;
  emit('load-user');
  setTimeout(() => {
    isLoadingMore.value = false;
  }, 1000);
};
</script>

<style scoped>
.user-list-manage-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.manage-card {
  width: 100%;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-count {
  font-size: 14px;
  color: #666;
}

.count-number {
  font-weight: 600;
  margin: 0 4px;
}

.card-content {
  padding: 24px;
}

.table-container {
  margin-bottom: 24px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

.action-section {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.load-btn {
  min-width: 160px;
}

@media screen and (max-width: 768px) {
  
  .card-header {
    padding: 16px 20px;
    flex-wrap: wrap;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    margin-top: 12px;
    gap: 8px;
  }
  
  .user-count {
    font-size: 12px;
  }
  
  .card-content {
    padding: 20px 16px;
  }
  
  .table-container {
    margin-bottom: 20px;
  }
  
  .load-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>
