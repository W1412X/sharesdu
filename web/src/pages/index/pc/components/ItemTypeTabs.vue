<template>
  <!-- PC 端显示 -->
  <div class="row-center" :style="themeColorStyle">
    <button 
      class="tab-button"
      :class="{ 'tab-button--active': modelValue === 'article' }"
      @click="handleItemTypeChange('article')"
    >
      文章
    </button>
    <button 
      class="tab-button"
      :class="{ 'tab-button--active': modelValue === 'post' }"
      @click="handleItemTypeChange('post')"
    >
      帖子
    </button>
    <button 
      class="tab-button"
      :class="{ 'tab-button--active': modelValue === 'course' }"
      @click="handleItemTypeChange('course')"
    >
      课程
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (value) => ['article', 'post', 'course', 'section'].includes(value),
  },
  ifMobile: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const localItemType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleItemTypeChange = (value) => {
  localItemType.value = value;
  emit('update:modelValue', value);
};

// 为移动端样式提供主题色
const themeColorStyle = computed(() => ({
  '--theme-color': props.themeColor,
}));
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .row-center {
    display: flex;
    flex-direction: row;
    width: fit-content;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .tab-button {
    position: relative;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
    outline: none;
    min-width: 60px;
    text-align: center;
  }

  .tab-button:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-button--active {
    color: #ffffff;
    font-weight: 600;
  }

  .tab-button--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 2px;
    background-color: #ffffff;
    border-radius: 2px;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 24px;
      opacity: 1;
    }
  }

  .tab-button:active {
    transform: scale(0.98);
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .row-center {
    display: flex;
    flex-direction: row;
    width: fit-content;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  .tab-button {
    position: relative;
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: #8a8a8a;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
    outline: none;
    min-width: 50px;
    text-align: center;
  }

  .tab-button:hover {
    color: rgba(0, 0, 0, 0.6);
    background: rgba(0, 0, 0, 0.05);
  }

  .tab-button--active {
    color: var(--theme-color);
    font-weight: 600;
  }

  .tab-button--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background-color: var(--theme-color);
    border-radius: 2px;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 20px;
      opacity: 1;
    }
  }

  .tab-button:active {
    transform: scale(0.98);
  }
}
</style>


