<template>
  <!-- PC 端显示 -->
  <div v-if="!ifMobile" class="row-center">
    <v-tabs v-model="localItemType" fixed-tabs class="select-bar" :color="themeColor">
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'article' ? '#000000' : '#8a8a8a' 
        }"
        height="40px" 
        value="article" 
        text="文章"
      ></v-tab>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'post' ? '#000000' : '#8a8a8a' 
        }"
        height="40px" 
        value="post" 
        text="帖子"
      ></v-tab>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'course' ? '#000000' : '#8a8a8a' 
        }"
        height="40px" 
        value="course" 
        text="课程"
      ></v-tab>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'section' ? '#000000' : '#8a8a8a' 
        }"
        height="40px" 
        value="section" 
        text="板块"
      ></v-tab>
    </v-tabs>
  </div>
  
  <!-- 移动端显示 -->
  <div v-else class="select-bar">
    <v-tabs v-model="localItemType" fixed-tabs class="mobile-tabs" :color="themeColor" hide-slider>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'article' ? themeColor : '#8a8a8a',
          fontWeight: localItemType == 'article' ? '600' : '400'
        }"
        height="40px" 
        value="article" 
        text="文章" 
        class="mobile-tab"
        :class="{ 'mobile-tab--active': localItemType == 'article' }"
      ></v-tab>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'post' ? themeColor : '#8a8a8a',
          fontWeight: localItemType == 'post' ? '600' : '400'
        }"
        height="40px" 
        value="post" 
        text="帖子" 
        class="mobile-tab"
        :class="{ 'mobile-tab--active': localItemType == 'post' }"
      ></v-tab>
      <v-tab
        :style="{ 
          background: 'rgba(255,255,255,1)', 
          color: localItemType == 'course' ? themeColor : '#8a8a8a',
          fontWeight: localItemType == 'course' ? '600' : '400'
        }"
        height="40px" 
        value="course" 
        text="课程" 
        class="mobile-tab"
        :class="{ 'mobile-tab--active': localItemType == 'course' }"
      ></v-tab>
    </v-tabs>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (value) => ['article', 'post', 'course'].includes(value),
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
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .select-bar {
    z-index: 2;
    position: fixed;
    width: 750px;
    height: 40px;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .select-bar {
    z-index: 2;
    width: 100vw;
    position: fixed;
    background-color: white;
    height: 40px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .mobile-tabs {
    width: 100%;
    height: 100%;
  }

  .mobile-tab {
    text-transform: none;
    letter-spacing: 0.5px;
    font-size: var(--font-size-small);
    transition: all 0.2s ease;
    position: relative;
  }

  .mobile-tab--active {
    position: relative;
  }

  .mobile-tab--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background-color: currentColor;
    border-radius: 2px;
  }
}
</style>


