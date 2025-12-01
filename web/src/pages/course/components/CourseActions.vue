<template>
  <div class="bottom-bar">
    <div class="column-center user-name text-medium">{{ userName }}</div>
    <v-spacer class="spacer"></v-spacer>
    <div class="row-reverse">
      <div v-if="!ifMaster&&!ifMobile" class="column-center padding-right-5px">
        <alert-button :id="course.id" :type="'course'"></alert-button>
      </div>
      <manage-button
        v-if="ifMaster&&!ifMobile"
        :id="course.id"
        :type="'course'"
        style="margin-right:10px;max-width: 25px;max-height: 25px;border-radius: 100%;"
      ></manage-button>
      <div class="column-center padding-right-10px">
        <v-btn elevation="0" @click="$emit('show-post')" icon class="bottom-btn">
          <v-icon icon="mdi-comment-outline" size="24"></v-icon>
          <v-tooltip activator="parent">查看帖子</v-tooltip>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertButton from '@/components/report/AlertButton.vue';
import ManageButton from '@/components/manage/ManageButton.vue';
import { getDeviceType } from '@/utils/device';

defineProps({
  course: {
    type: Object,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
});
const ifMobile=getDeviceType()=='mobile';
defineEmits(['show-post']);
</script>

<style scoped>
.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.row-reverse {
  display: flex;
  flex-direction: row-reverse;
}

.padding-right-5px {
  padding-right: 5px;
}

.padding-right-10px {
  padding-right: 10px;
}

.bottom-btn {
  width: 23px;
  height: 23px;
  color: #8a8a8a;
  background-color: rgba(0, 0, 0, 0);
}

@media screen and (min-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 800px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }
  .user-name {
    margin-left: 10px;
    max-width: 300px;
    color: var(--theme-color);
  }
}

@media screen and (max-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 100vw;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }
  .user-name {
    margin-left: 2vw;
    width: 30vw;
    color: var(--theme-color);
  }
}
</style>

