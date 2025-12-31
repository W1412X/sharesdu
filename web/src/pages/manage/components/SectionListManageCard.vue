<template>
  <v-card class="manage-card" elevation="2">
    <v-card-title class="card-header">
      <v-icon icon="mdi-bulletin-board" :color="themeColor" size="24" class="header-icon"></v-icon>
      <span class="header-title">板块列表</span>
      <v-spacer></v-spacer>
      <span class="section-count">
        共<span class="count-number" :style="{ color: themeColor }">{{ sectionList.length }}</span>个板块
      </span>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="card-content">
      <div class="section-list-container">
        <template v-if="sectionList.length > 0">
          <section-item 
            v-for="(section, index) in sectionList" 
            :key="index"
            :init-data="section"
          ></section-item>
        </template>
        <nothing-view 
          v-else-if="!loading"
          icon="mdi-bulletin-board-outline" 
          text="暂无板块" 
          :icon-size="80"
          text-size="18px"
          min-height="300px"
        ></nothing-view>
        <div v-if="loading" class="loading-container">
          <v-progress-circular
            indeterminate
            :color="themeColor"
            size="48"
          ></v-progress-circular>
        </div>
      </div>
      
      <div class="action-section">
        <v-btn 
          @click="handleRefresh" 
          variant="outlined" 
          :color="themeColor"
          :disabled="loading"
          :loading="loading"
          size="large"
          prepend-icon="mdi-refresh"
          class="refresh-btn">
          刷新列表
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import SectionItem from '@/components/section/SectionItem/index.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  sectionList: {
    type: Array,
    default: () => [],
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

const emit = defineEmits([
  'refresh',
]);

const handleRefresh = () => {
  emit('refresh');
};
</script>

<style scoped>
.manage-card {
  width: 100%;
  max-width: 1200px;
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

.section-count {
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

.section-list-container {
  margin-bottom: 24px;
  min-height: 200px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
}

@media screen and (max-width: 768px) {
  .section-list-container {
    gap: 8px;
    justify-content: space-between;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.action-section {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.refresh-btn {
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
  
  .section-count {
    font-size: 12px;
    width: 100%;
    margin-top: 8px;
  }
  
  .card-content {
    padding: 20px 16px;
  }
  
  .section-list-container {
    margin-bottom: 20px;
  }
  
  .refresh-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>

