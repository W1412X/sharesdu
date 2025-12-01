<template>
  <v-card v-if="ifShow" variant="outlined" class="column-div-scroll user-list-card" style="margin-top: 10px;">
    <div style="display: flex; flex-direction: row; align-items: center;">
      <v-icon size="30" color="#8a8a8a">mdi-account</v-icon>
      <span style="color: #8a8a8a; margin-left: 10px;" class="text-medium-bold">封禁列表</span>
    </div>
    <div
      v-for="(item, index) in blockUserList"
      :key="index"
      style="display: flex; flex-direction: column; align-items: center; padding: 10px;">
      <avatar-name :init-data="{ id: item.id, name: item.username }"></avatar-name>
      <div>由 {{ item.operator }} 封禁至 {{ item.endTime }}</div>
    </div>
  </v-card>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName';

defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  blockUserList: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.user-list-card {
  padding: 10px;
}
</style>

