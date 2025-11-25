<template>
  <!-- PC端导航抽屉 -->
  <v-navigation-drawer
    v-if="deviceType === 'desktop'"
    v-model="drawerModel"
    :rail="railModel"
    permanent
    @click="handleRailClick"
  >
    <v-list-item class="name" :prepend-avatar="user.profileUrl" :title="user.name" nav>
    </v-list-item>
    <v-divider></v-divider>
    <v-btn
      v-if="!railModel"
      size="30"
      class="menu-btn"
      :icon="'mdi-chevron-left'"
      @click.stop="handleToggleRail"
    ></v-btn>
    <v-list density="compact" nav :color="themeColor" v-model="chooseModel">
      <v-list-item
        @click="handleChoose('info')"
        prepend-icon="mdi-account"
        title="资料"
        value="info"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('write')"
        prepend-icon="mdi-pencil"
        title="创作"
        value="write"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('star')"
        prepend-icon="mdi-star"
        title="收藏"
        value="star"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('notification')"
        prepend-icon="mdi-bell"
        title="通知"
        value="notification"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('chat')"
        prepend-icon="mdi-chat"
        title="私信"
        value="chat"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('account')"
        prepend-icon="mdi-account-edit"
        title="账户"
        value="account"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('setting')"
        prepend-icon="mdi-cog"
        title="设置"
        value="setting"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- 移动端导航抽屉 -->
  <v-navigation-drawer
    v-if="deviceType === 'mobile' && navVisible"
    v-model="drawerModel"
    :rail="false"
    permanent
  >
    <v-list-item class="name" :prepend-avatar="user.profileUrl" :title="user.name" nav>
    </v-list-item>
    <v-divider></v-divider>
    <v-btn
      size="30"
      class="menu-btn"
      :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
      @click="$emit('update:navVisible', !navVisible)"
    ></v-btn>
    <v-list density="compact" nav :color="themeColor" v-model="chooseModel">
      <v-list-item
        @click="handleChoose('info')"
        prepend-icon="mdi-account"
        title="资料"
        value="info"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('write')"
        prepend-icon="mdi-pencil"
        title="创作"
        value="write"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('star')"
        prepend-icon="mdi-star"
        title="收藏"
        value="star"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('notification')"
        prepend-icon="mdi-bell"
        title="通知"
        value="notification"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('chat')"
        prepend-icon="mdi-chat"
        title="私信"
        value="chat"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('account')"
        prepend-icon="mdi-account"
        title="账户"
        value="account"
      ></v-list-item>
      <v-list-item
        @click="handleChoose('setting')"
        prepend-icon="mdi-cog"
        title="设置"
        value="setting"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- 移动端菜单按钮 -->
  <v-btn
    v-if="deviceType === 'mobile'"
    size="30"
    class="mobile-menu-btn"
    :icon="'mdi-chevron-right'"
    @click="$emit('update:navVisible', true)"
  ></v-btn>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  drawer: {
    type: Boolean,
    default: true,
  },
  rail: {
    type: Boolean,
    default: true,
  },
  navVisible: {
    type: Boolean,
    default: false,
  },
  choose: {
    type: String,
    default: 'info',
  },
  deviceType: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:drawer', 'update:rail', 'update:navVisible', 'update:choose']);

// 计算属性
const drawerModel = computed({
  get: () => props.drawer,
  set: (value) => emit('update:drawer', value),
});

const railModel = computed({
  get: () => props.rail,
  set: (value) => emit('update:rail', value),
});

const chooseModel = computed({
  get: () => props.choose,
  set: (value) => emit('update:choose', value),
});

// 处理方法
const handleChoose = (value) => {
  emit('update:choose', value);
  if (props.deviceType === 'mobile') {
    emit('update:navVisible', false);
  }
};

const handleRailClick = () => {
  emit('update:rail', false);
};

const handleToggleRail = () => {
  emit('update:rail', !props.rail);
};
</script>

<style scoped>
.name {
  color: var(--theme-color);
  margin-left: 8px;
}

.menu-btn {
  position: fixed;
  bottom: 50%;
  right: -15px;
  z-index: 100;
}

.mobile-menu-btn {
  position: fixed;
  bottom: 50%;
  left: 0px;
  z-index: 100;
}
</style>

