<template>
  <div class="bottom-bar">
    <div class="column-center user-name text-medium">{{ userName }}</div>
    <v-spacer class="spacer"></v-spacer>
    <div class="row-reverse">
      <!-- 管理员按钮 -->
      <div v-if="ifMaster && !ifMobile" class="column-center padding-right-5px">
        <manage-button :id="article.id" :type="'article'" size="23" />
      </div>
      
      <!-- 举报按钮 -->
      <div v-if="userId != article.authorId && !ifMobile" class="column-center padding-right-5px">
        <alert-button :id="article.id" :type="'article'" />
      </div>
      
      <!-- 编辑和删除按钮（作者） -->
      <div v-else-if="!ifMobile" class="row-div">
        <div class="column-center padding-right-5px">
          <v-btn elevation="0" @click="$emit('edit')" icon class="bottom-btn">
            <v-icon icon="mdi-pencil-outline" size="23"></v-icon>
          </v-btn>
        </div>
        <div class="column-center padding-right-5px">
          <delete-button
            @delete="$emit('delete')"
            :id="article.id"
            :type="'article'"
            :size="24"
            @alert="$emit('alert', $event)"
            @set_loading="$emit('set-loading', $event)"
          />
        </div>
      </div>
      
      <!-- 评论按钮 -->
      <div class="column-center padding-right-10px">
        <v-btn elevation="0" @click="$emit('comment')" icon class="bottom-btn">
          <v-icon icon="mdi-comment-outline" size="23"></v-icon>
          <v-tooltip activator="parent">查看帖子</v-tooltip>
        </v-btn>
      </div>
      
      <!-- 收藏按钮 -->
      <div class="column-center padding-right-10px">
        <star-button
          v-if="article.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :type="'article'"
          :id="article.id"
          :state="article.ifStar"
        />
      </div>
      
      <!-- 点赞按钮 -->
      <div class="column-center padding-right-5px">
        <like-button
          v-if="article.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :id="article.id"
          :type="'article'"
          :state="article.ifLike"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ManageButton from '@/components/manage/ManageButton.vue';
import AlertButton from '@/components/report/AlertButton.vue';
import DeleteButton from '@/components/common/DeleteButton.vue';
import StarButton from '@/components/star/StarButton.vue';
import LikeButton from '@/components/common/LikeButton.vue';
import { getDeviceType } from '@/utils/device';

defineProps({
  article: {
    type: Object,
    required: true,
  },
  userId: {
    type: String,
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
defineEmits(['edit', 'delete', 'comment', 'alert', 'set-loading']);
</script>

<style scoped>
.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.padding-right-5px {
  padding-right: 5px;
}

.padding-right-10px {
  padding-right: 10px;
}

.row-div {
  overflow-x: auto;
  max-width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
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
    width: 1000px;
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

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
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

  .spacer {
    max-width: 30vw;
    font-size: 0px;
  }

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
    width: 40vw;
  }
}
</style>

