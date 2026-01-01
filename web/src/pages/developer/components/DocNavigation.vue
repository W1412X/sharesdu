<template>
  <div class="doc-navigation">
    <v-card
      v-if="prevDoc"
      class="nav-card prev-card"
      variant="outlined"
      :color="themeColor"
      @click="handleNavClick(prevDoc.key)"
    >
      <div class="nav-content">
        <v-icon size="20" class="nav-icon">mdi-chevron-left</v-icon>
        <div class="nav-text">
          <div class="nav-label">上一页</div>
          <div class="nav-title">{{ prevDoc.title }}</div>
        </div>
      </div>
    </v-card>
    
    <v-spacer v-if="prevDoc && nextDoc"></v-spacer>
    
    <v-card
      v-if="nextDoc"
      class="nav-card next-card"
      variant="outlined"
      :color="themeColor"
      @click="handleNavClick(nextDoc.key)"
    >
      <div class="nav-content">
        <div class="nav-text">
          <div class="nav-label">下一页</div>
          <div class="nav-title">{{ nextDoc.title }}</div>
        </div>
        <v-icon size="20" class="nav-icon">mdi-chevron-right</v-icon>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { globalProperties } from '@/main';

const themeColor = globalProperties.$themeColor;

defineProps({
  prevDoc: {
    type: Object,
    default: null,
  },
  nextDoc: {
    type: Object,
    default: null,
  },
  themeColor: {
    type: String,
    default: '#667eea',
  },
});

const emit = defineEmits(['navigate']);

const handleNavClick = (key) => {
  emit('navigate', key);
};
</script>

<style scoped>
.doc-navigation {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.nav-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.nav-card:hover {
  transform: translateY(-2px);
}

.prev-card:hover {
  border-left: 4px solid var(--theme-color, v-bind(themeColor));
}

.next-card:hover {
  border-right: 4px solid var(--theme-color, v-bind(themeColor));
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.prev-card .nav-content {
  justify-content: flex-start;
}

.next-card .nav-content {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.nav-icon {
  color: var(--theme-color, v-bind(themeColor));
  flex-shrink: 0;
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.nav-title {
  font-size: 1rem;
  color: #1a202c;
  font-weight: 600;
  line-height: 1.4;
}

@media screen and (max-width: 1000px) {
  .doc-navigation {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    padding: 16px 0;
  }
  
  .nav-card {
    width: 100%;
  }
  
  .nav-content {
    padding: 16px;
  }
  
  .next-card .nav-content {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

