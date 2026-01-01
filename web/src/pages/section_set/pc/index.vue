<template>
  <div class="section-set-page">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <p class="text-title">浏览所有板块内容</p>
      </div>
      
      <!-- 板块网格 -->
      <v-pull-to-refresh 
        id="item-container" 
        :pull-down-threshold="64" 
        @load="handleRefresh" 
      >
        <SectionGrid
          :section-list="sectionList"
          :loading="loading"
        />
      </v-pull-to-refresh>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { SectionGrid } from './components';
import { useSectionSetState, useSectionSetData, useSectionSetLoad } from '../utils';

// 定义组件名称
defineOptions({
  name: 'SectionSetPagePc'
});

// 定义 emit
const emit = defineEmits(['alert', 'set_loading']);

// 使用 Composables
const {
  ifMounted,
} = useSectionSetState();

const {
  sectionList,
  loading,
  allLoad,
  setSections,
  addSections,
} = useSectionSetData();

// 加载逻辑
const { refresh, loadMore } = useSectionSetLoad(
  sectionList,
  loading,
  allLoad,
  setSections,
  addSections,
  (msg) => emit('alert', msg)
);

// 处理刷新
const handleRefresh = async ({ done }) => {
  await refresh();
  done('ok');
};

// 挂载时加载数据
onMounted(async () => {
  // 设置页面标题
  const webTitle = document.getElementById('web-title');
  if (webTitle) {
    webTitle.innerText = 'ShareSDU | 全部板块';
  }
  
  await loadMore();
  ifMounted.value = true;
});
</script>

<style scoped>
.section-set-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 0;
}

.page-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}
</style>

