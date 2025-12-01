<template>
  <v-navigation-drawer
    v-if="deviceType === 'mobile' && navVisible"
    :model-value="drawer"
    :rail="false"
    permanent
    @update:model-value="$emit('update:drawer', $event)"
    @click="rail = false">
    <v-divider></v-divider>
    <v-btn
      size="30"
      class="menu-btn"
      :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
      @click="$emit('update:navVisible', !navVisible)">
    </v-btn>
    <v-list
      density="compact"
      nav
      :color="themeColor"
      :model-value="choose"
      @update:model-value="$emit('update:choose', $event)">
      <v-list-item
        base-color="#dddddd"
        variant="outlined"
        v-for="(user, index) in chatUsers"
        :key="index"
        :value="user.id"
        @click="$emit('select-user', index)">
        <div class="row-div">
          <avatar-name
            :clickable="false"
            :if-show-name="false"
            :size="45"
            :init-data="{ id: user.id, name: user.name }">
          </avatar-name>
          <div class="column-div">
            <div class="msg-summary-div text-small-bold">
              {{ user.name }}
            </div>
            <div class="msg-summary-div text-small">
              {{ (user.lastMsg.isSelf ? '' : user.name + ' : ') + user.lastMsg.content }}
            </div>
            <div class="msg-time-div text-min">
              {{ user.lastMsg.time }}
            </div>
          </div>
        </div>
        <template v-if="user.msgNum > 0" v-slot:append>
          <v-badge color="error" :content="user.msgNum" inline></v-badge>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName';

defineProps({
  deviceType: {
    type: String,
    required: true,
  },
  navVisible: {
    type: Boolean,
    required: true,
  },
  drawer: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  choose: {
    type: [String, Number],
    default: null,
  },
  chatUsers: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  'update:drawer',
  'update:navVisible',
  'update:choose',
  'select-user',
]);
</script>

<style scoped>
.menu-btn {
  position: fixed;
  bottom: 50%;
  z-index: 100;
}

.row-div {
  display: flex;
  flex-direction: row;
}

.column-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}

.msg-summary-div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #8a8a8a;
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 2px;
  margin-left: 15px;
}

.msg-time-div {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-left: 15px;
  color: #8a8a8a;
}
</style>

