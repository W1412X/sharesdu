<template>
  <v-card v-if="ifShow" class="edit-finish-card">
    <div class="title-bold row-center">提示</div>
    <div class="text-medium row-center">离开此页面后您编辑的内容将不会保存！</div>
    <div class="row-center">
      <v-btn
        @click="$emit('confirm-leave')"
        variant="outlined"
        :color="themeColor"
        class="dialog-bottom-bar-btn"
      >
        确认离开
      </v-btn>
      <v-btn
        @click="$emit('cancel-leave')"
        class="dialog-bottom-bar-btn"
        :color="themeColor"
        variant="outlined"
      >
        留在此页
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['confirm-leave', 'cancel-leave']);
</script>

<style scoped>
.title-bold {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.text-medium {
  font-size: 14px;
  margin-bottom: 15px;
}

.row-center {
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
}

.dialog-bottom-bar-btn {
  height: 35px;
  margin: 10px;
}

.edit-finish-card {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

@media screen and (min-width: 1000px) {
  .edit-finish-card {
    width: 300px;
  }
}

@media screen and (max-width: 1000px) {
  .edit-finish-card {
    width: 80vw;
  }
}
</style>


