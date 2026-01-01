<template>
  <div class="section-selector-container">
    <div class="section-scroll-wrapper" ref="scrollWrapper">
      <div class="section-list" ref="sectionListElement">
        <v-btn
          v-for="section in sectionList"
          :key="section.id"
          :data-section-id="section.id"
          :variant="'tonal'"
          rounded="lg"
          :color="section.id === selectedSectionId ? themeColor : 'grey-darken-1'"
          size="small"
          class="section-item"
          :class="{ 'section-item--active': section.id === selectedSectionId }"
          @click="handleSectionClick(section.id)"
        >
          {{ section.title || section.sectionName || '未命名板块' }}
        </v-btn>
      </div>
    </div>
    <!-- 固定在右侧的"查看全部"按钮 -->
    <div class="view-all-button-wrapper">
      <v-btn
        append-icon="mdi-chevron-right"
        variant="text"
        rounded="lg"
        :color="themeColor"
        size="small"
        class="view-all-button"
        @click="handleViewAllClick"
      >
        全部
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { openPage } from '@/utils/other';

const props = defineProps({
  sectionList: {
    type: Array,
    required: true,
  },
  selectedSectionId: {
    type: [Number, String],
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:selectedSectionId']);

const scrollWrapper = ref(null);
const sectionListElement = ref(null);

const handleSectionClick = (sectionId) => {
  emit('update:selectedSectionId', sectionId);
  // 滚动到选中的板块
  scrollToSelected(sectionId);
};

const handleViewAllClick = () => {
  openPage('router', {
    name: 'SectionSetPage'
  });
};

const scrollToSelected = (sectionId) => {
  nextTick(() => {
    if (!scrollWrapper.value || !sectionListElement.value) return;
    
    const selectedItem = sectionListElement.value.querySelector(`[data-section-id="${sectionId}"]`);
    if (selectedItem) {
      const containerWidth = scrollWrapper.value.offsetWidth;
      const itemLeft = selectedItem.offsetLeft;
      const itemWidth = selectedItem.offsetWidth;
      const scrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
      
      scrollWrapper.value.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  });
};

// 监听选中板块变化，自动滚动
watch(() => props.selectedSectionId, (newId) => {
  scrollToSelected(newId);
}, { immediate: true });
</script>

<style scoped>
.section-selector-container {
  width: 100%;
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
}

.section-scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  min-width: 0; /* 允许 flex 子元素收缩 */
}

.section-scroll-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.section-list {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 0 16px 0 16px;
  min-width: fit-content;
}

.view-all-button-wrapper {
  flex-shrink: 0;
  background-color: white;
  position: sticky;
  right: 0;
  z-index: 1;
}

.view-all-button {
  transition: all 0.2s ease;
  padding-left: 10px;
  padding-top: 1px;
  padding-bottom: 3px;
  padding-right: 10px;
  white-space: nowrap;
  text-transform: none;
  font-size: var(--font-size-small);
}

.section-item {
  transition: all 0.2s ease;
  padding-left: 10px;
  padding-top: 1px;
  padding-bottom: 3px;
  padding-right: 10px;
}

.section-item--active {
  font-weight: 600;
}
</style>

