<template>
  <div v-if="searchType === '文章'" class="article-filter-container">
    <v-btn
      variant="outlined"
      :color="ifArticleFilter ? themeColor : 'grey'"
      @click="ifArticleFilter = !ifArticleFilter"
      prepend-icon="mdi-filter-menu-outline"
    >
      筛选
    </v-btn>
    <span
      v-if="!ifArticleFilter"
      :style="{ color: themeColor, 'margin-left': '20px' }"
      class="text-medium"
    >
      通过
      <span class="text-medium-bold">标签</span>
      筛选文章
    </span>
    <div v-if="ifArticleFilter" class="article-tag-container">
      <!-- delete btn -->
      <v-btn
        v-for="tag in filtArticleTags"
        :key="tag"
        :color="themeColor"
        :text="tag"
        variant="tonal"
        class="tag-btn"
      >
        {{ tag }}
        <v-spacer></v-spacer>
        <v-btn
          @click="$emit('delete-tag', tag)"
          size="15"
          density="compact"
          variant="tonal"
          class="delete-tag-btn"
        >
          ✕
        </v-btn>
      </v-btn>
      <div style="display: flex; flex-direction: row; align-items: center;">
        <sensitive-text-field
          style="margin-left: 10px; margin-right: 10px; min-width: 100px;"
          hide-details
          variant="outlined"
          v-model="localEditingArticleFiltTag"
          density="compact"
          :max-width="'150px'"
          label="输入筛选标签"
        />
        <!-- add btn -->
        <v-btn :color="themeColor" @click="handleAddTag" variant="tonal">
          添加筛选标签
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { getNormalInfoAlert } from '@/utils/other';

const props = defineProps({
  searchType: {
    type: String,
    required: true,
  },
  ifArticleFilter: {
    type: Boolean,
    required: true,
  },
  filtArticleTags: {
    type: Array,
    required: true,
  },
  editingArticleFiltTag: {
    type: String,
    default: '',
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'update:if-article-filter',
  'update:editing-article-filt-tag',
  'add-tag',
  'delete-tag',
  'alert',
]);

const ifArticleFilter = computed({
  get: () => props.ifArticleFilter,
  set: (value) => emit('update:if-article-filter', value),
});

const localEditingArticleFiltTag = computed({
  get: () => props.editingArticleFiltTag,
  set: (value) => emit('update:editing-article-filt-tag', value),
});

const handleAddTag = () => {
  if (!props.editingArticleFiltTag) {
    emit('alert', getNormalInfoAlert('标签不可为空'));
    return;
  }
  if (props.filtArticleTags.includes(props.editingArticleFiltTag)) {
    emit('alert', getNormalInfoAlert('标签已存在'));
    return;
  }
  emit('add-tag', props.editingArticleFiltTag);
};
</script>

<style scoped>
.tag-btn {
  min-width: 0px;
  padding-top: 0px;
  padding-right: 3px;
  padding-bottom: 1px;
  margin-bottom: 5px;
  margin-left: 3px;
  margin-right: 3px;
}

.delete-tag-btn {
  border-radius: 50px;
  height: 15px;
  margin: 5px;
  font-size: 12px;
  color: #8a8a8a;
  font-weight: 600;
  padding-top: 0px;
  margin-right: 0px;
  padding-right: 0px;
  margin-left: 10px;
}

.article-filter-container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 6px;
  margin-right: 30px;
  max-width: none;
  flex: 1;
  align-items: center;
}

.article-tag-container {
  padding: 6px;
  margin-right: 30px;
  max-width: none;
  flex: 1;
  align-items: center;
}
</style>
