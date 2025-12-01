<!-- src/App.vue - 主入口，根据设备类型动态加载移动端或PC端组件 -->
<template>
  <v-dialog v-if="ifShowDialog" v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
      <post-editor v-if="ifShowPostEditor" @close="closeDialog" @alert="alert" @set_loading="setLoading"
        @add_post="addPost"></post-editor>
      <course-editor v-if="ifShowCourseEditor" @close="closeDialog" @alert="alert"
        @set_loading="setLoading"></course-editor>
    </div>
  </v-dialog>
  <!-- 根据设备类型动态加载对应组件 -->
  <app-mobile v-if="ifMobile"></app-mobile>
  <app-desktop v-else></app-desktop>
</template>
<script>
import { provide } from 'vue';
import PostEditor from '@/components/post/PostEditor.vue';
import CourseEditor from '@/components/course/CourseEditor.vue';
import AppMobile from './AppMobile.vue';
import AppDesktop from './AppDesktop.vue';
import { useDevice, useDialog, useMessage } from './app/composables';

export default {
  name: 'App',
  setup() {
    // 设备类型
    const { deviceType, ifMobile } = useDevice();
    
    // 消息和加载状态
    const { alertMsg, loadMsg, loadState, alert, setLoading, setLoadState } = useMessage();
    
    // 对话框管理（全局共享）
    const {
      ifShowDialog,
      ifShowPostEditor,
      ifShowCourseEditor,
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
    } = useDialog();
    
    // 通过 provide 共享对话框状态和方法给子组件
    provide('dialog', {
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
    });
    
    // 通过 provide 共享消息方法给子组件
    provide('message', {
      alert,
      setLoading,
    });
    
    return {
      // 设备
      deviceType,
      ifMobile,
      // 消息
      alertMsg,
      loadMsg,
      loadState,
      alert,
      setLoading,
      setLoadState,
      // 对话框
      ifShowDialog,
      ifShowPostEditor,
      ifShowCourseEditor,
      setPostEditorState,
      setCourseEditorState,
      closeDialog,
    };
  },
  components: {
    PostEditor,
    CourseEditor,
    AppMobile,
    AppDesktop,
  },
  methods: {
    addPost() {
      // 如果需要处理添加帖子后的逻辑，可以在这里实现
    },
  },
};
</script>
<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
}
</style>
