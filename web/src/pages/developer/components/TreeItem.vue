<template>
  <div>
    <v-list-item
      :active="item.file && activeKey === item.key"
      @click="handleClick"
      :title="item.title"
      :value="item.key"
      class="tree-item"
      :class="{ 'tree-item-folder': item.children, 'tree-item-file': item.file }"
      :style="{ paddingLeft: `${8 + level * 20}px` }"
    >
      <template v-slot:prepend>
        <div class="item-prepend">
          <v-btn
            v-if="item.children && item.children.length > 0"
            icon
            size="x-small"
            variant="text"
            @click.stop="handleToggle"
            class="expand-btn"
          >
            <v-icon size="16">
              {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
            </v-icon>
          </v-btn>
          <v-icon 
            v-if="item.icon" 
            :size="item.children ? 20 : 20" 
            class="item-icon"
            :class="{ 'folder-icon': item.children, 'file-icon': item.file }"
          >
            {{ item.icon }}
          </v-icon>
        </div>
      </template>
    </v-list-item>
    
    <div v-if="item.children && item.children.length > 0 && isExpanded" class="tree-children">
      <tree-item
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :level="level + 1"
        :active-key="activeKey"
        :expanded-keys="expandedKeys"
        @click="$emit('click', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  activeKey: {
    type: String,
    default: '',
  },
  expandedKeys: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(['click', 'toggle']);

const isExpanded = computed(() => {
  return props.expandedKeys.has(props.item.key);
});

const handleClick = () => {
  if (props.item.file) {
    emit('click', props.item);
  } else if (props.item.children) {
    handleToggle();
  }
};

const handleToggle = () => {
  emit('toggle', props.item.key);
};
</script>

<style scoped>
.tree-item {
  min-height: 40px;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 4px;
}

.tree-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.tree-item-file {
  font-weight: 400;
}

.tree-item-folder {
  font-weight: 500;
}

.item-prepend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.expand-btn {
  min-width: 20px;
  width: 20px;
  height: 20px;
  padding: 0;
}

.item-icon {
  flex-shrink: 0;
}

.folder-icon {
  opacity: 0.8;
}

.file-icon {
  opacity: 0.6;
}

.tree-children {
  overflow: hidden;
}
</style>

