<template>
  <div class="top-reciever-div">
    <v-btn
      v-if="deviceType !== 'desktop'"
      icon="mdi-format-list-bulleted"
      variant="text"
      @click="$emit('show-nav')">
    </v-btn>
    <avatar-name
      v-if="deviceType === 'desktop'"
      color="white"
      style="margin-left: 10px;"
      :init-data="{ id: selfId, name: selfName }">
    </avatar-name>
    <v-spacer></v-spacer>
    <span>{{ receiverId ? receiverName : '' }}</span>
    <v-spacer></v-spacer>
    <v-btn
      icon="mdi-home"
      variant="text"
      @click="$emit('to-home')">
    </v-btn>
  </div>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName.vue';

defineProps({
  deviceType: {
    type: String,
    required: true,
  },
  selfId: {
    type: String,
    required: true,
  },
  selfName: {
    type: String,
    required: true,
  },
  receiverId: {
    type: [String, Number],
    default: null,
  },
  receiverName: {
    type: String,
    default: '',
  },
});

defineEmits([
  'show-nav',
  'to-home',
]);
</script>

<style scoped>
.top-reciever-div {
  color: white;
  font-size: 18px;
  height: 40px;
  z-index: 999;
  width: 100vw;
  justify-content: center;
  display: flex;
  align-items: center;
  font-weight: bold;
  flex-direction: row;
  background-color: var(--theme-color);
}
</style>

