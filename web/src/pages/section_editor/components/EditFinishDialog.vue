<template>
  <v-card v-if="ifShow" class="edit-finish-card">
    <div class="title-bold row-center">编辑成功</div>
    <div class="text-medium row-center">您的文章已上传，正在审核中...</div>
    <div class="row-center">
      <v-btn
        @click="$emit('to-index-page')"
        variant="outlined"
        :color="themeColor"
        class="dialog-bottom-bar-btn"
      >
        返回主页
      </v-btn>
      <v-btn
        @click="$emit('to-article-page')"
        class="dialog-bottom-bar-btn"
        :color="themeColor"
        variant="outlined"
      >
        查看文章
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

defineEmits(['to-index-page', 'to-article-page']);
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


