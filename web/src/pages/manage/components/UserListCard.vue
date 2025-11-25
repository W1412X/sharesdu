<template>
  <v-card v-if="ifShow" variant="outlined" class="column-div-scroll user-list-card" style="margin-top: 10px;">
    <span class="text-small">
      共<span :style="{ 'font-weight': 'bold', 'color': themeColor }">{{ totalUserNum }}</span>个用户
    </span>
    <v-data-table :items="userList" fixed-header hover>
      <template v-slot:[`item.用户`]="{ item }">
        <avatar-name :init-data="{ id: item.ID, name: item.用户 }"></avatar-name>
      </template>
      <template v-slot:[`item.是否为管理员`]="{ item }">
        <v-icon
          :icon="item.是否为管理员 ? 'mdi-check-bold' : 'mdi-close-thick'"
          :color="item.是否为管理员 ? 'success' : 'error'">
        </v-icon>
      </template>
      <template v-slot:[`item.是否为超级管理员`]="{ item }">
        <v-icon
          :icon="item.是否为超级管理员 ? 'mdi-check-bold' : 'mdi-close-thick'"
          :color="item.是否为超级管理员 ? 'success' : 'error'">
        </v-icon>
      </template>
    </v-data-table>
    <v-btn @click="$emit('load-more')" variant="tonal" style="width: 100%;">加载更多</v-btn>
  </v-card>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName.vue';

defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  userList: {
    type: Array,
    required: true,
  },
  totalUserNum: {
    type: Number,
    default: null,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['load-more']);
</script>

<style scoped>
.user-list-card {
  padding: 10px;
}
</style>

