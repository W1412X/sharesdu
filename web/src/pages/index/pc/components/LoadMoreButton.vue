<template>
  <v-btn 
    v-if="!allLoad" 
    @click="$emit('load-more')" 
    variant="text"
    :loading="loading" 
    class="load-btn" 
    :color="themeColor"
  >
    {{ "加载更多" }}
  </v-btn>
</template>

<script setup>
defineProps({
  allLoad: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['load-more']);
</script>

<style scoped>
.load-btn {
  height: 30px;
  width: 100%;
  margin-top: 5px;
}
</style>


