<template>
  <div class="manage-page-container">
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
    
    <!-- 内容区域 -->
    <div class="content-area" :class="{ 'with-drawer': drawer && !rail }">
    <UserManageCard
      v-if="choose === 'user'"
      :item-id="itemId"
      :block-days="blockDays"
      :block-user-list="blockUserList"
      :theme-color="themeColor"
      @update:itemId="itemId = $event"
      @update:blockDays="blockDays = $event"
      @show-confirm="handleShowConfirm"
      @unblock="handleUnblock"
      @load-block-user="handleLoadBlockUser">
    </UserManageCard>
    
    <!-- 用户列表管理卡片 -->
    <UserListManageCard
      v-if="choose === 'user-list'"
      :user-list="userList"
      :total-user-num="totalUserNum"
      :page-size="userPageSize"
      :theme-color="themeColor"
      @load-user="handleLoadUser"
      @update:page-size="handlePageSizeChange">
    </UserListManageCard>
    
    <!-- 文章管理卡片 -->
    <ArticleManageCard
      v-if="choose === 'article'"
      :item-id="itemId"
      :block-reason="blockReason"
      :theme-color="themeColor"
      @update:itemId="itemId = $event"
      @update:blockReason="blockReason = $event"
      @show-confirm="handleShowConfirm"
      @unblock="handleUnblock">
    </ArticleManageCard>
    
    <!-- 板块列表管理卡片 -->
    <SectionListManageCard
      v-if="choose === 'section-list'"
      :section-list="sectionList"
      :theme-color="themeColor"
      :loading="isLoadingSectionList"
      @refresh="handleRefreshSectionList">
    </SectionListManageCard>
    
    <!-- 课程管理卡片 -->
    <CourseManageCard
      v-if="choose === 'course'"
      :item-id="itemId"
      :theme-color="themeColor"
      @update:itemId="itemId = $event"
      @show-confirm="handleShowConfirm"
      @unfreeze="handleUnfreeze"
      @rollback="handleRollback"
      @delete="handleShowDeleteConfirm">
    </CourseManageCard>
    
    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon icon="mdi-alert" color="error" class="mr-2"></v-icon>
          确认删除课程
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">确定要删除课程 ID: <strong>{{ itemId }}</strong> 吗？</p>
          <p class="text-body-2 text-error mt-2">此操作不可恢复，请谨慎操作！</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="showDeleteDialog = false">
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="isDeleting"
            @click="handleDeleteCourse">
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 邀请码管理卡片 -->
    <invite-code-manage-card
      v-if="choose === 'invite'"
      @alert="handleAlert"
      @set_loading="handleSetLoading">
    </invite-code-manage-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import InviteCodeManageCard from '@/components/manage/InviteCodeManageCard.vue';
import {
  ManageNavigationDrawer,
  UserManageCard,
  UserListManageCard,
  ArticleManageCard,
  CourseManageCard,
  SectionListManageCard,
  ManageDialog,
} from './components';
import {
  useManageState,
  useManageData,
  useManageActions,
} from './utils';
import { getNormalWarnAlert } from '@/utils/other';

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
  setWebCardState,
  setCourseHistoryState,
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
  userPageSize,
  blockUserList,
  blockUserPageNum,
  nowShowUrl,
  sectionList,
  addUsers,
  addBlockUsers,
  unshiftBlockUser,
  setSectionList,
} = useManageData();

// 操作处理
const {
  showConfirm,
  unblock,
  unfreeze,
  confirm,
  rollback,
  deleteCourseAction,
  loadUser,
  loadBlockUser,
  loadSectionList,
} = useManageActions(
  itemType,
  itemId,
  blockDays,
  blockReason,
  userList,
  userPageNum,
  maxUserPageNum,
  totalUserNum,
  userPageSize,
  blockUserList,
  blockUserPageNum,
  nowShowUrl,
  addUsers,
  addBlockUsers,
  unshiftBlockUser,
  setSectionList,
  setWebCardState,
  setCourseHistoryState,
  (msg) => emit('set_loading', msg),
  (msg) => emit('alert', msg)
);

// 事件处理
const handleChooseChange = (newChoose) => {
  choose.value = newChoose;
  // 根据选择的模块更新 itemType，用于操作逻辑
  if (newChoose === 'user' || newChoose === 'article' || newChoose === 'course') {
    itemType.value = newChoose;
  }
  // 注意：加载逻辑由 watch(choose) 处理，避免重复加载
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

const handleShowDeleteConfirm = () => {
  if (!itemId.value) {
    handleAlert(getNormalWarnAlert('请设置课程ID'));
    return;
  }
  showDeleteDialog.value = true;
};

const handleDeleteCourse = async () => {
  isDeleting.value = true;
  try {
    await deleteCourseAction();
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('删除课程失败:', error);
  } finally {
    isDeleting.value = false;
  }
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

const handleLoadUser = async () => {
  await loadUser();
};

const handlePageSizeChange = (newSize) => {
  userPageSize.value = newSize;
  // 改变每页数量时，重置列表并重新加载
  userList.value = [];
  userPageNum.value = 1;
  maxUserPageNum.value = null;
  handleLoadUser();
};

const handleRefreshSectionList = async () => {
  await loadSectionList();
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

// 使用 ref 标记是否正在加载，防止重复加载
const isLoadingUserList = ref(false);
const isLoadingSectionList = ref(false);

// 删除确认对话框状态
const showDeleteDialog = ref(false);
const isDeleting = ref(false);

// 监听 choose 变化
watch(choose, (newVal, oldVal) => {
  // 根据选择的模块更新 itemType
  if (newVal === 'user' || newVal === 'article' || newVal === 'course') {
    itemType.value = newVal;
  }
  // 切换到用户列表管理时，如果列表为空且不在加载中，则加载
  // 只在真正切换时加载（oldVal 不为 undefined 且与 newVal 不同）
  if (newVal === 'user-list' && oldVal !== undefined && newVal !== oldVal && userList.value.length === 0 && !isLoadingUserList.value) {
    isLoadingUserList.value = true;
    handleLoadUser().finally(() => {
      isLoadingUserList.value = false;
    });
  }
  // 切换到板块列表管理时，如果列表为空且不在加载中，则加载
  if (newVal === 'section-list' && oldVal !== undefined && newVal !== oldVal && sectionList.value.length === 0 && !isLoadingSectionList.value) {
    isLoadingSectionList.value = true;
    handleRefreshSectionList().finally(() => {
      isLoadingSectionList.value = false;
    });
  }
}, { immediate: false });

// 挂载时初始化
onMounted(() => {
  if (props.init_type) {
    itemType.value = props.init_type;
    // 根据 init_type 设置默认的 choose 值
    if (props.init_type === 'user' || props.init_type === 'article' || props.init_type === 'course') {
      choose.value = props.init_type;
    }
  }
  if (props.init_id) {
    itemId.value = props.init_id;
  }
  // 如果初始选择是用户列表管理且列表为空，则加载
  if (choose.value === 'user-list' && userList.value.length === 0 && !isLoadingUserList.value) {
    isLoadingUserList.value = true;
    handleLoadUser().finally(() => {
      isLoadingUserList.value = false;
    });
  }
  // 如果初始选择是板块列表管理且列表为空，则加载
  if (choose.value === 'section-list' && sectionList.value.length === 0 && !isLoadingSectionList.value) {
    isLoadingSectionList.value = true;
    handleRefreshSectionList().finally(() => {
      isLoadingSectionList.value = false;
    });
  }
});
</script>

<style scoped>
.manage-page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  overflow-y: auto;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.card {
    width: 100%;
  max-width: 1200px;
  height: fit-content;
  padding: 24px;
  margin: 0;
}

@media screen and (max-width: 1000px) {
  .manage-page-container {
    width: 100vw;
    height: 100vh;
  }

  .content-area {
    padding: 15px;
  }

  .card {
    padding: 15px;
  }
}
</style>

