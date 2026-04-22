<template>
  <div id="user-list" class="user-list">
    <loading-content-wrapper
      :load-state="!loading.loadUsers"
      loading-text="正在加载聊天列表..."
      variant="list"
      :item-count="5"
      min-height="300px"
    >
      <template v-if="chatUsers.length > 0">
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
      </template>
      <nothing-view
        v-if="ifMounted && chatUsers.length === 0"
        icon="mdi-chat-outline"
        text="暂无私聊"
        :icon-size="80"
        text-size="18px"
        min-height="300px">
      </nothing-view>
    </loading-content-wrapper>
  </div>
</template>

<script setup>
import AvatarName from '@/components/common/AvatarName';
import NothingView from '@/components/common/NothingView.vue';
import LoadingContentWrapper from '@/components/common/LoadingContentWrapper.vue';

defineProps({
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
  ifMounted: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits([
  'update:choose',
  'select-user',
]);
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  width: 350px;
  flex-shrink: 0;
  border-right: 0.5px solid #ccc;
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
