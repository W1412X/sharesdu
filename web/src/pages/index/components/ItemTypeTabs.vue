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
    </v-tabs>
  </div>
  
  <!-- 移动端显示 -->
  <div v-else class="select-bar">
    <div class="row-div-bottom">
      <v-btn 
        variant="text" 
        :color="localItemType == 'article' ? themeColor : '#8a8a8a'" 
        text="文章" 
        class="mobile-select-button text-small" 
        @click="localItemType = 'article'"
      ></v-btn>
      <v-btn 
        variant="text" 
        :color="localItemType == 'post' ? themeColor : '#8a8a8a'" 
        text="帖子" 
        class="mobile-select-button text-small" 
        @click="localItemType = 'post'"
      ></v-btn>
      <v-btn 
        variant="text" 
        :color="localItemType == 'course' ? themeColor : '#8a8a8a'" 
        text="课程" 
        class="mobile-select-button text-small" 
        @click="localItemType = 'course'"
      ></v-btn>
    </div>
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
.row-div-bottom {
  display: flex;
  flex-direction: row;
  align-items: end;
  width: fit-content;
  height: 100%;
}

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
  }

  .mobile-select-button {
    height: 28px;
    width: 40px;
    margin-left: 5px;
    margin-right: 5px;
  }
}
</style>


