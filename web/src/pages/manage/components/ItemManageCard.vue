<template>
  <v-card class="card column-div-scroll">
    <v-select
      label="对象类型"
      density="compact"
      variant="outlined"
      :items="['article', 'user', 'course']"
      :model-value="itemType"
      @update:model-value="$emit('update:itemType', $event)">
    </v-select>
    
    <v-textarea
      label="ID"
      rows="1"
      density="compact"
      variant="outlined"
      :model-value="itemId"
      @update:model-value="$emit('update:itemId', $event)"
      hint="ID">
    </v-textarea>
    
    <v-textarea
      v-if="itemType === 'user'"
      label="封禁时间（整数1-90）"
      rows="1"
      density="compact"
      variant="outlined"
      :model-value="blockDays"
      @update:model-value="$emit('update:blockDays', $event)">
    </v-textarea>
    
    <v-textarea
      v-if="itemType === 'article'"
      label="封禁原因"
      rows="2"
      density="compact"
      variant="outlined"
      :model-value="blockReason"
      @update:model-value="$emit('update:blockReason', $event)">
    </v-textarea>
    
    <div style="display: flex; flex-direction: row-reverse; align-items: center;">
      <v-btn
        v-if="itemType === 'article' || itemType === 'user'"
        variant="outlined"
        @click="$emit('show-confirm')"
        :color="themeColor"
        prepend-icon="mdi-lock">
        封禁
      </v-btn>
      <v-btn
        v-if="itemType === 'article' || itemType === 'user'"
        variant="outlined"
        style="margin-right: 10px;"
        @click="$emit('unblock')"
        :color="themeColor"
        prepend-icon="mdi-lock-open-variant">
        解封
      </v-btn>
      <v-btn
        v-if="itemType === 'course'"
        variant="outlined"
        style="margin-right: 10px;"
        @click="$emit('show-confirm')"
        :color="themeColor"
        prepend-icon="mdi-lock">
        冻结
      </v-btn>
      <v-btn
        v-if="itemType === 'course'"
        variant="outlined"
        style="margin-right: 10px;"
        @click="$emit('unfreeze')"
        :color="themeColor"
        prepend-icon="mdi-lock-open-variant">
        解冻
      </v-btn>
      <v-btn
        v-if="itemType === 'course'"
        variant="outlined"
        style="margin-right: 10px;"
        @click="$emit('rollback')"
        :color="themeColor"
        prepend-icon="mdi-undo">
        回滚
      </v-btn>
      <v-spacer></v-spacer>
      <span style="color: #8a8a8a;" class="text-medium"></span>
    </div>
    
    <div style="display: flex; flex-direction: row; align-items: center; padding: 10px;">
      <v-btn @click="$emit('show-user-list')" variant="text">查看用户列表</v-btn>
      <v-btn @click="$emit('show-block-user-list')" variant="text">查看封禁用户</v-btn>
    </div>
    
    <UserListCard
      :if-show="ifShowUserList"
      :user-list="userList"
      :total-user-num="totalUserNum"
      :theme-color="themeColor"
      @load-more="$emit('load-user')">
    </UserListCard>
    
    <BlockUserListCard
      :if-show="ifShowBlockUserList"
      :block-user-list="blockUserList">
    </BlockUserListCard>
  </v-card>
</template>

<script setup>
import UserListCard from './UserListCard.vue';
import BlockUserListCard from './BlockUserListCard.vue';

defineProps({
  itemType: {
    type: String,
    default: null,
  },
  itemId: {
    type: String,
    default: null,
  },
  blockDays: {
    type: Number,
    default: 0,
  },
  blockReason: {
    type: String,
    default: '',
  },
  ifShowUserList: {
    type: Boolean,
    default: false,
  },
  ifShowBlockUserList: {
    type: Boolean,
    default: false,
  },
  userList: {
    type: Array,
    default: () => [],
  },
  totalUserNum: {
    type: Number,
    default: null,
  },
  blockUserList: {
    type: Array,
    default: () => [],
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits([
  'update:itemType',
  'update:itemId',
  'update:blockDays',
  'update:blockReason',
  'show-confirm',
  'unblock',
  'unfreeze',
  'rollback',
  'show-user-list',
  'show-block-user-list',
  'load-user',
]);
</script>

<style scoped>
.column-div-scroll {
  display: flex;
  flex-direction: column;
  max-height: 650px;
  overflow: auto;
}

@media screen and (max-width: 1000px) {
  .column-div-scroll {
    max-height: 80vh;
  }
}
</style>

