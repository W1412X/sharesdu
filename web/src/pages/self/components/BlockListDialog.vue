<template>
  <div v-if="ifShow" @close="handleClose" class="block-list-container">
    <div class="row-reverse">
      <v-btn
        size="20"
        color="#8a8a8a"
        variant="text"
        icon="mdi-close"
        @click="handleClose"
      ></v-btn>
    </div>
    <div v-for="(item, index) in blockList" :key="index" class="block-item">
      <avatar-name v-if="item.id" :init-data="item" />
      <v-spacer />
      <v-btn @click="handleCancelBlock(index)" variant="text">取消拉黑</v-btn>
    </div>
  </div>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName';

// Props
defineProps({
  ifShow: {
    type: Boolean,
    default: false,
  },
  blockList: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['close', 'cancel-block']);

// 处理方法
const handleClose = () => {
  emit('close');
};

const handleCancelBlock = (index) => {
  emit('cancel-block', index);
};
</script>

<style scoped>
.row-reverse {
  display: flex;
  flex-direction: row-reverse;
}

.block-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  border-bottom: solid 1px #8a8a8a;
}

@media screen and (min-width: 1000px) {
  .block-list-container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    max-height: 800px;
    width: 600px;
  }
}

@media screen and (max-width: 1000px) {
  .block-list-container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    max-height: 60vh;
    width: 80vw;
  }
}
</style>

