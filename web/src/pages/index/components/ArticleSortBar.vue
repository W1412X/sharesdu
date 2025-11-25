<template>
  <div v-if="!ifMobile" class="sort-method-bar">
    <v-spacer />
    <v-btn 
      variant="tonal" 
      class="text-small sort-btn" 
      @click="$emit('update:sortMethod', 'time')"
      type="mdi" 
      :color="sortMethod == 'time' ? themeColor : 'grey'"
      prepend-icon="mdi-sort-clock-ascending-outline" 
      text="最近发布"
    ></v-btn>
    <v-spacer />
    <v-btn 
      variant="tonal" 
      class="text-small sort-btn" 
      @click="$emit('update:sortMethod', 'star')"
      type="mdi" 
      :color="sortMethod == 'star' ? themeColor : 'grey'"
      prepend-icon="mdi-star-check-outline" 
      text="最多收藏"
    ></v-btn>
    <v-spacer />
    <v-btn 
      variant="tonal" 
      class="text-small sort-btn" 
      @click="$emit('update:sortMethod', 'view')"
      type="mdi" 
      :color="sortMethod == 'view' ? themeColor : 'grey'"
      prepend-icon="mdi-eye-outline" 
      text="最多浏览"
    ></v-btn>
    <v-spacer />
    <v-btn 
      variant="tonal" 
      class="text-small sort-btn" 
      @click="$emit('update:sortMethod', 'hot')" 
      type="mdi"
      :color="sortMethod == 'hot' ? themeColor : 'grey'" 
      prepend-icon="mdi-fire"
      text="最高热度"
    ></v-btn>
    <v-spacer />
  </div>
</template>

<script setup>
defineProps({
  sortMethod: {
    type: String,
    required: true,
    validator: (value) => ['time', 'star', 'view', 'hot'].includes(value),
  },
  themeColor: {
    type: String,
    required: true,
  },
  ifMobile: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:sortMethod']);
</script>

<style scoped>
.sort-btn {
  margin-left: 10px;
  max-height: 25px;
}

/** desktop */
@media screen and (min-width: 1000px) {
  .sort-method-bar {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    overflow-x: auto;
    padding: 5px;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .sort-method-bar {
    width: 100vw;
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    overflow-x: auto;
    padding: 5px;
  }
}
</style>


