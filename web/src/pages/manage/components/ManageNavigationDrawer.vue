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
    <v-list density="compact" nav :color="themeColor">
      <!-- 用户管理组 -->
      <v-list-group value="user-group">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-group"
            title="用户管理">
          </v-list-item>
        </template>
        <v-list-item
          :active="choose === 'user'"
          @click="$emit('update:choose', 'user')"
          prepend-icon="mdi-account-lock"
          title="用户封禁管理"
          value="user"
          class="nav-sub-item">
        </v-list-item>
        <v-list-item
          :active="choose === 'user-list'"
          @click="$emit('update:choose', 'user-list')"
          prepend-icon="mdi-account-multiple"
          title="用户列表管理"
          value="user-list"
          class="nav-sub-item">
        </v-list-item>
      </v-list-group>
      
      <!-- 文章管理 -->
      <v-list-item
        :active="choose === 'article'"
        @click="$emit('update:choose', 'article')"
        prepend-icon="mdi-file-document-edit"
        title="文章管理"
        value="article">
      </v-list-item>
      
      <!-- 板块管理组 -->
      <v-list-group value="section-group">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-bulletin-board"
            title="板块管理">
          </v-list-item>
        </template>
        <v-list-item
          :active="choose === 'section-list'"
          @click="$emit('update:choose', 'section-list')"
          prepend-icon="mdi-format-list-bulleted"
          title="板块列表"
          value="section-list"
          class="nav-sub-item">
        </v-list-item>
      </v-list-group>
      
      <!-- 课程管理 -->
      <v-list-item
        :active="choose === 'course'"
        @click="$emit('update:choose', 'course')"
        prepend-icon="mdi-book-open-variant"
        title="课程管理"
        value="course">
      </v-list-item>
      
      <!-- 邀请码管理 -->
      <v-list-item
        :active="choose === 'invite'"
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
    <v-list density="compact" nav :color="themeColor">
      <!-- 用户管理组 -->
      <v-list-group value="user-group">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-group"
            title="用户管理">
          </v-list-item>
        </template>
        <v-list-item
          :active="choose === 'user'"
          @click="$emit('update:choose', 'user')"
          prepend-icon="mdi-account-lock"
          title="用户封禁管理"
          value="user"
          class="nav-sub-item">
        </v-list-item>
        <v-list-item
          :active="choose === 'user-list'"
          @click="$emit('update:choose', 'user-list')"
          prepend-icon="mdi-account-multiple"
          title="用户列表管理"
          value="user-list"
          class="nav-sub-item">
        </v-list-item>
      </v-list-group>
      
      <!-- 文章管理 -->
      <v-list-item
        :active="choose === 'article'"
        @click="$emit('update:choose', 'article')"
        prepend-icon="mdi-file-document-edit"
        title="文章管理"
        value="article">
      </v-list-item>
      
      <!-- 板块管理组 -->
      <v-list-group value="section-group">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-bulletin-board"
            title="板块管理">
          </v-list-item>
        </template>
        <v-list-item
          :active="choose === 'section-list'"
          @click="$emit('update:choose', 'section-list')"
          prepend-icon="mdi-format-list-bulleted"
          title="板块列表"
          value="section-list"
          class="nav-sub-item">
        </v-list-item>
      </v-list-group>
      
      <!-- 课程管理 -->
      <v-list-item
        :active="choose === 'course'"
        @click="$emit('update:choose', 'course')"
        prepend-icon="mdi-book-open-variant"
        title="课程管理"
        value="course">
      </v-list-item>
      
      <!-- 邀请码管理 -->
      <v-list-item
        :active="choose === 'invite'"
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

.nav-sub-item {
  padding-left: 32px !important;
}
</style>
