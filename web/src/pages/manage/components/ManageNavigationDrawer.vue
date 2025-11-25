<template>
  <!-- PC端导航抽屉 -->
  <v-navigation-drawer
    v-if="deviceType === 'desktop'"
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="rail"
    permanent
    @click="$emit('update:rail', false)">
    <v-btn
      v-if="!rail"
      size="30"
      class="menu-btn"
      :icon="'mdi-chevron-left'"
      @click.stop="$emit('update:rail', !rail)">
    </v-btn>
    <v-list density="compact" nav :color="themeColor" :model-value="choose" @update:model-value="$emit('update:choose', $event)">
      <v-list-item
        @click="$emit('update:choose', 'item')"
        prepend-icon="mdi-sitemap"
        title="对象管理"
        value="item">
      </v-list-item>
      <v-list-item
        @click="$emit('update:choose', 'invite')"
        prepend-icon="mdi-account-plus"
        title="邀请码管理"
        value="invite">
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  
  <!-- 移动端导航抽屉 -->
  <v-navigation-drawer
    v-if="deviceType === 'mobile' && navVisible"
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="false"
    permanent
    @click="$emit('update:rail', false)">
    <v-btn
      size="30"
      class="menu-btn"
      :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
      @click="$emit('update:navVisible', !navVisible)">
    </v-btn>
    <v-list density="compact" nav :color="themeColor" :model-value="choose" @update:model-value="$emit('update:choose', $event)">
      <v-list-item
        @click="$emit('update:choose', 'item')"
        prepend-icon="mdi-sitemap"
        title="对象管理"
        value="item">
      </v-list-item>
      <v-list-item
        @click="$emit('update:choose', 'invite')"
        prepend-icon="mdi-account-plus"
        title="邀请码管理"
        value="invite">
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  
  <!-- 移动端菜单按钮 -->
  <v-btn
    v-if="deviceType === 'mobile'"
    size="30"
    class="mobile-menu-btn"
    :icon="'mdi-chevron-right'"
    @click="$emit('update:navVisible', true)">
  </v-btn>
</template>

<script setup>
defineProps({
  deviceType: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  drawer: {
    type: Boolean,
    required: true,
  },
  rail: {
    type: Boolean,
    required: true,
  },
  navVisible: {
    type: Boolean,
    required: true,
  },
  choose: {
    type: String,
    required: true,
  },
});

defineEmits(['update:drawer', 'update:rail', 'update:navVisible', 'update:choose']);
</script>

<style scoped>
.mobile-menu-btn {
  position: fixed;
  bottom: 50%;
  left: 0px;
  z-index: 100;
}

.menu-btn {
  position: fixed;
  bottom: 50%;
  right: -15px;
  z-index: 100;
}
</style>

