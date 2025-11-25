<template>
  <div class="full-center">
    <!-- 对话框 -->
    <ManageDialog
      :if-show-dialog="ifShowDialog"
      :if-show-web-card="ifShowWebCard"
      :if-show-course-history="ifShowCourseHistory"
      :now-show-url="nowShowUrl"
      :item-id="itemId"
      :theme-color="themeColor"
      @update:ifShowDialog="() => {}"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close-course-history="handleCloseCourseHistory"
      @set-loading="handleSetLoading"
      @alert="handleAlert">
    </ManageDialog>
    
    <!-- 导航抽屉 -->
    <ManageNavigationDrawer
      :device-type="deviceType"
      :theme-color="themeColor"
      :drawer="drawer"
      :rail="rail"
      :nav-visible="navVisible"
      :choose="choose"
      @update:drawer="drawer = $event"
      @update:rail="rail = $event"
      @update:navVisible="navVisible = $event"
      @update:choose="handleChooseChange">
    </ManageNavigationDrawer>
    
    <!-- 对象管理卡片 -->
    <ItemManageCard
      v-if="choose === 'item'"
      :item-type="itemType"
      :item-id="itemId"
      :block-days="blockDays"
      :block-reason="blockReason"
      :if-show-user-list="ifShowUserList"
      :if-show-block-user-list="ifShowBlockUserList"
      :user-list="userList"
      :total-user-num="totalUserNum"
      :block-user-list="blockUserList"
      :theme-color="themeColor"
      @update:itemType="itemType = $event"
      @update:itemId="itemId = $event"
      @update:blockDays="blockDays = $event"
      @update:blockReason="blockReason = $event"
      @show-confirm="handleShowConfirm"
      @unblock="handleUnblock"
      @unfreeze="handleUnfreeze"
      @rollback="handleRollback"
      @show-user-list="handleShowUserList"
      @show-block-user-list="handleShowBlockUserList"
      @load-user="handleLoadUser">
    </ItemManageCard>
    
    <!-- 邀请码管理卡片 -->
    <invite-code-manage-card
      v-if="choose === 'invite'"
      @alert="handleAlert"
      @set_loading="handleSetLoading">
    </invite-code-manage-card>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import InviteCodeManageCard from '@/components/manage/InviteCodeManageCard.vue';
import {
  ManageNavigationDrawer,
  ItemManageCard,
  ManageDialog,
} from './components';
import {
  useManageState,
  useManageData,
  useManageActions,
} from './utils';

// 定义组件名称
defineOptions({
  name: 'ManagePage',
});

// Props
const props = defineProps({
  init_id: {
    type: String,
    default: null,
  },
  init_type: {
    type: String,
    default: null, // 'article' | 'user' | 'course'
  },
});

// Emits
const emit = defineEmits(['alert', 'set_loading']);

// 使用 Composables
const {
  themeColor,
  deviceType,
  drawer,
  rail,
  navVisible,
  choose,
  ifShowWebCard,
  ifShowCourseHistory,
  ifShowDialog,
  ifShowUserList,
  ifShowBlockUserList,
  setWebCardState,
  setCourseHistoryState,
  setUserListState,
  setBlockUserListState,
} = useManageState();

const {
  itemType,
  itemId,
  blockDays,
  blockReason,
  userList,
  userPageNum,
  maxUserPageNum,
  totalUserNum,
  blockUserList,
  blockUserPageNum,
  nowShowUrl,
  addUsers,
  addBlockUsers,
  unshiftBlockUser,
} = useManageData();

// 操作处理
const {
  showConfirm,
  unblock,
  unfreeze,
  confirm,
  rollback,
  loadUser,
  loadBlockUser,
} = useManageActions(
  itemType,
  itemId,
  blockDays,
  blockReason,
  userList,
  userPageNum,
  maxUserPageNum,
  totalUserNum,
  blockUserList,
  blockUserPageNum,
  nowShowUrl,
  addUsers,
  addBlockUsers,
  unshiftBlockUser,
  setWebCardState,
  setCourseHistoryState,
  (msg) => emit('set_loading', msg),
  (msg) => emit('alert', msg)
);

// 事件处理
const handleChooseChange = (newChoose) => {
  choose.value = newChoose;
  if (choose.value === 'item' && userList.value.length === 0) {
    handleLoadUser();
  }
};

const handleShowConfirm = () => {
  showConfirm();
};

const handleUnblock = async () => {
  try {
    await unblock();
  } catch (error) {
    console.error('解封操作失败:', error);
  }
};

const handleUnfreeze = async () => {
  await unfreeze();
};

const handleRollback = () => {
  rollback();
};

const handleConfirm = async () => {
  await confirm();
};

const handleCancel = () => {
  setWebCardState(false);
};

const handleCloseCourseHistory = () => {
  setCourseHistoryState(false);
};

const handleShowUserList = () => {
  setUserListState(true);
  if (userList.value.length === 0) {
    handleLoadUser();
  }
};

const handleShowBlockUserList = () => {
  setBlockUserListState(true);
  if (blockUserList.value.length === 0) {
    handleLoadBlockUser();
  }
};

const handleLoadUser = async () => {
  await loadUser();
};

const handleLoadBlockUser = async () => {
  await loadBlockUser();
};

const handleAlert = (msg) => {
  emit('alert', msg);
};

const handleSetLoading = (msg) => {
  emit('set_loading', msg);
};

// 监听 choose 变化
watch(choose, (newVal) => {
  if (newVal === 'item' && userList.value.length === 0) {
    handleLoadUser();
  }
}, { immediate: true });

// 挂载时初始化
onMounted(() => {
  if (props.init_type) {
    itemType.value = props.init_type;
  }
  if (props.init_id) {
    itemId.value = props.init_id;
  }
});
</script>

<style scoped>
.full-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

.card {
  margin: 20px;
  width: 1000px;
  max-height: 800px;
  padding: 20px;
}

.column-div-scroll {
  display: flex;
  flex-direction: column;
  max-height: 650px;
  overflow: auto;
}

@media screen and (min-width: 1000px) {
  .full-center {
    width: 100%;
  }
}

@media screen and (max-width: 1000px) {
  .full-center {
    width: 100vw;
    height: 100vh;
  }

  .card {
    width: 90vw;
    max-height: 90vh;
    padding: 15px;
  }

  .column-div-scroll {
    max-height: 80vh;
  }
}
</style>

